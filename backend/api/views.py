from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.db.models import Q, Sum
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings, DrinkOverride
from .serializers import (
    UserSerializer, BookingSerializer, MenuItemSerializer,
    OrderSerializer, AdRequestSerializer, SiteSettingsSerializer
)
from .permissions import IsAdminUser, IsAdminOrReadOnly, IsOwnerOrAdmin

# Pool session capacities - matching frontend configuration
POOL_SESSION_CAPACITIES = {
    "6:00 AM - 8:00 AM": 15,
    "8:00 AM - 10:00 AM": 8,
    "10:00 AM - 12:00 PM": 20,
    "2:00 PM - 4:00 PM": 25,
    "4:00 PM - 6:00 PM": 5,
    "6:00 PM - 8:00 PM": 12,
}

class UserViewSet(viewsets.ModelViewSet):
    """User management - Admin only"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

from django.core.mail import send_mail
from django.conf import settings

class BookingViewSet(viewsets.ModelViewSet):
    """Bookings - Authenticated users can create, admins can manage all"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'check_availability']:
            return [AllowAny()]  # Allow unauthenticated for availability check
        elif self.action == 'my_bookings':
            return [IsAuthenticated()]
        elif self.action in ['list', 'retrieve']:
            return [IsAdminUser()]  # Only admin can see all bookings
        return [IsAdminUser()]  # Admin for update/delete

    def perform_update(self, serializer):
        """
        Override perform_update to send email notifications on status change
        """
        # Get the previous status to check if it changed
        instance = serializer.instance
        old_status = instance.status
        
        # Save the new status
        updated_booking = serializer.save()
        
        # Check if status changed
        if old_status != updated_booking.status:
            self._send_status_email(updated_booking)

    def _send_status_email(self, booking):
        """Send email notification to user about booking status change"""
        recipient_email = booking.email or (booking.user.email if booking.user else None)
        
        if not recipient_email:
            return
            
        subject = f"Booking Update: {booking.booking_type} - {booking.status}"
        
        status_message = ""
        if booking.status == 'Confirmed':
            status_message = "Your booking has been confirmed! We look forward to seeing you."
        elif booking.status == 'Rejected' or booking.status == 'Cancelled':
            status_message = "We regret to inform you that your booking could not be accommodated at this time."
        elif booking.status == 'Completed':
            status_message = "Thank you for visiting! We hope you enjoyed your experience."
        
        message = f"""
Dear {booking.guest_name or 'Valued Customer'},

The status of your booking has been updated.

Booking Details:
Type: {booking.booking_type}
Date: {booking.date or booking.start_date}
Status: {booking.status.upper()}

{status_message}

Thank you for choosing AYA Community Centre.

Best regards,
AYA Team
"""
        
        try:
            print(f"Sending email to {recipient_email}...")
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
                fail_silently=False,
            )
            print("Email sent successfully!")
        except Exception as e:
            print(f"Failed to send email: {e}")

    def _normalize_date_string(self, date_str):
        """Normalize date string for comparison - extracts date portion from various formats"""
        if not date_str:
            return ""
        # Remove time and extra details, keep just the date portion
        # Date formats can be like "January 1, 2024" or "January 1, 2024 at 10:00 AM" etc.
        # Extract the date part (before " at " or " | ")
        try:
            date_part = date_str.split(" at ")[0].split(" | ")[0].strip()
            return date_part
        except (IndexError, AttributeError):
            return ""

    def _safe_int_conversion(self, value, default=1):
        """Safely convert value to int, return default if conversion fails"""
        try:
            if value is None or value == '':
                return default
            return int(value)
        except (ValueError, TypeError):
            return default

    def _extract_session_time(self, date_str):
        """Extract session time from date string like 'January 1, 2024 at 6:00 AM - 8:00 AM'"""
        if not date_str or not isinstance(date_str, str):
            return None
        try:
            if " at " in date_str:
                # Extract the part after " at " and before any " | " or other separators
                time_part = date_str.split(" at ")[1].split(" | ")[0].strip()
                # Common pool session time patterns
                session_patterns = [
                    "6:00 AM - 8:00 AM",
                    "8:00 AM - 10:00 AM", 
                    "10:00 AM - 12:00 PM",
                    "2:00 PM - 4:00 PM",
                    "4:00 PM - 6:00 PM",
                    "6:00 PM - 8:00 PM"
                ]
                
                # Check if the extracted time matches any known session pattern
                for pattern in session_patterns:
                    if pattern in time_part:
                        return pattern
                
                # If no exact match, return the extracted time part
                return time_part
        except (IndexError, AttributeError):
            return None
        return None

    def _check_booking_conflict(self, booking_type, date_str, requested_slots=1):
        """
        Check if there's a conflicting booking for same type and date.
        For Pool Sessions, checks if there are enough slots available.
        For Sports (Tennis/Volleyball), checks court conflicts regardless of sport type.
        For Events, checks time conflicts based on duration.
        For Memberships/Packages, no conflict check needed (duration-based).
        Returns (is_conflict, message) tuple.
        """
        if not booking_type:
            return (False, "")
        
        # Skip conflict check for memberships and packages (duration-based)
        if any(x in booking_type.lower() for x in ["membership", "package"]):
            return (False, "No conflict check needed for memberships")
        
        if not date_str:
            return (False, "")
        
        normalized_date = self._normalize_date_string(date_str)
        if not normalized_date:
            return (False, "")

        # Special handling for Events - check time conflicts based on duration
        if "event" in booking_type.lower():
            # Get all existing events for the same date
            existing_events = Booking.objects.filter(
                booking_type__icontains="event",
                status__in=['Pending', 'Confirmed', 'Completed']
            )
            
            # Check if any existing event conflicts with this time
            for booking in existing_events:
                existing_date = self._normalize_date_string(booking.date)
                
                if existing_date == normalized_date:
                    # Extract duration from booking details if available
                    # Format: "Package: Standard | Guests: 50 | Duration: 4 hours"
                    booking_details = getattr(booking, 'date', '')
                    
                    # Simple conflict check for now - events on same date conflict
                    # In a real system, you'd parse start/end times and check overlaps
                    return (True, f"An event is already booked on {normalized_date}. Please select a different date or contact us for multiple events.")
            
            return (False, "Event date is available")

        # Special handling for Pool Sessions - check slot capacity
        if booking_type == "Pool Session":
            session_time = self._extract_session_time(date_str)
            if not session_time or session_time not in POOL_SESSION_CAPACITIES:
                # If session time not found or invalid, treat as unavailable
                return (True, "Invalid pool session time")

            capacity = POOL_SESSION_CAPACITIES[session_time]
            
            # Get all bookings for this session (same date and time)
            # Only count non-cancelled bookings
            existing_bookings = Booking.objects.filter(
                booking_type=booking_type,
                status__in=['Pending', 'Confirmed', 'Completed']
            )
            
            # Calculate total slots already booked for this session
            total_booked_slots = 0
            for booking in existing_bookings:
                existing_session_time = self._extract_session_time(booking.date)
                existing_normalized_date = self._normalize_date_string(booking.date)
                
                if existing_session_time == session_time and existing_normalized_date == normalized_date:
                    total_booked_slots += booking.slots or 1  # Default to 1 if slots not set
            
            # Check if there are enough slots available
            available_slots = capacity - total_booked_slots
            if available_slots < requested_slots:
                return (
                    True,
                    f"Only {available_slots} slot(s) available for this session. Please select a different time or reduce the number of swimmers."
                )
            
            return (False, f"{available_slots} slot(s) available")

        # Special handling for Sports (Tennis/Volleyball) - check court conflicts
        if "session" in booking_type.lower():
            session_time = self._extract_session_time(date_str)
            if not session_time:
                return (True, "Invalid session time")
            
            # Get ALL court bookings (both Tennis and Volleyball) for this date/time
            # This prevents double-booking the same court for different sports
            court_bookings = Booking.objects.filter(
                booking_type__icontains="session",  # Both "Tennis session" and "Volleyball session"
                status__in=['Pending', 'Confirmed', 'Completed']
            )
            
            # Check if any existing court booking conflicts with this time
            for booking in court_bookings:
                existing_session_time = self._extract_session_time(booking.date)
                existing_normalized_date = self._normalize_date_string(booking.date)
                
                if existing_session_time == session_time and existing_normalized_date == normalized_date:
                    return (True, f"The court is already booked for {existing_session_time.replace(' - ', ' to ')} on {normalized_date}. Please select a different time.")
            
            return (False, "Court is available")

        # For non-pool, non-sports bookings, use simple conflict check (one booking per slot)
        conflicting_bookings = Booking.objects.filter(
            booking_type=booking_type,
            status__in=['Pending', 'Confirmed', 'Completed']
        )

        # Check if any existing booking's date matches the new booking date
        for booking in conflicting_bookings:
            existing_date_normalized = self._normalize_date_string(booking.date)
            if existing_date_normalized == normalized_date:
                return (True, "This slot is already booked")
        
        return (False, "Slot is available")

    def create(self, request, *args, **kwargs):
        """
        Override create to handle availability checks and prevent race conditions.
        For memberships and packages, skip availability checks.
        Uses database transaction to prevent race conditions.
        """
        booking_type = request.data.get('booking_type', '')
        date_str = request.data.get('date', '')
        requested_slots = self._safe_int_conversion(request.data.get('slots'), 1)
        
        # Skip availability check for memberships and packages (duration-based)
        if any(x in booking_type.lower() for x in ["membership", "package"]):
            # If it's a membership or package, proceed directly to creation
            return super().create(request, *args, **kwargs)
        
        # For date-based bookings (pool sessions, court sessions), check availability
        if date_str:
            # Use atomic transaction to prevent race conditions
            with transaction.atomic():
                is_conflict, conflict_message = self._check_booking_conflict(
                    booking_type, date_str, requested_slots
                )
                
                if is_conflict:
                    return Response(
                        {
                            "detail": conflict_message or f"This {booking_type} slot is already booked. Please select a different date/time.",
                            "error_code": "BOOKING_CONFLICT"
                        },
                        status=status.HTTP_409_CONFLICT
                    )
                
                # If no conflict, proceed with normal creation within transaction
                return super().create(request, *args, **kwargs)
        
        # If no date provided for non-membership, proceed with creation
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Auto-assign the logged-in user when creating a booking
        user = self.request.user if self.request.user.is_authenticated else None
        
        booking_type = self.request.data.get('booking_type', '')
        start_date = None
        due_date = None
        price = 0
        
        # Get price from frontend if provided (for Events, Sports, etc.)
        provided_price = self.request.data.get('price')
        
        # Calculate price for pool sessions
        if booking_type == "Pool Session":
            session_time = self._extract_session_time(self.request.data.get('date', ''))
            if session_time and session_time in POOL_SESSION_CAPACITIES:
                # Pool session prices
                POOL_SESSION_PRICES = {
                    "6:00 AM - 8:00 AM": 20,
                    "8:00 AM - 10:00 AM": 20,
                    "10:00 AM - 12:00 PM": 25,
                    "2:00 PM - 4:00 PM": 25,
                    "4:00 PM - 6:00 PM": 30,
                    "6:00 PM - 8:00 PM": 30,
                }
                session_price = POOL_SESSION_PRICES.get(session_time, 20)
                slots = self._safe_int_conversion(self.request.data.get('slots'), 1)
                
                # Use provided price if available (from frontend calculation for adults/teens/child mix)
                # Otherwise calculate basic price
                if provided_price:
                    price = float(provided_price)
                else:
                    price = session_price * slots
        
        # Calculate dates for memberships/packages
        elif any(x in booking_type for x in ["Membership", "Package"]):
            from django.utils import timezone
            from datetime import timedelta
            
            # Start membership the day after purchase
            start_date = timezone.now().date() + timedelta(days=1)
            
            # Use frontend-provided price if available
            if provided_price:
                price = float(provided_price)
            
            # Determine duration and fallback price (only if no frontend price)
            if "Daily" in booking_type:
                # Daily pass: starts tomorrow, valid for that entire day
                due_date = start_date  # Same day as start_date (1 day duration)
                if not provided_price:
                    price = 30
            elif "Monthly" in booking_type or "Gym Membership" in booking_type:
                # Monthly: starts tomorrow, ends 30 days later
                due_date = start_date + timedelta(days=30)
                if not provided_price:
                    price = 250
            elif "Annual" in booking_type:
                # Annual: starts tomorrow, ends 365 days later
                due_date = start_date + timedelta(days=365)
                if not provided_price:
                    price = 2000
            elif "Family Package" in booking_type:
                # Family Package: starts tomorrow, ends 30 days later
                due_date = start_date + timedelta(days=30)
                if not provided_price:
                    price = 400
            else:
                # Default for any other membership/package type
                due_date = start_date + timedelta(days=30)
        
        # For all other bookings (Events, Sports court sessions, etc.), use the price from frontend
        elif provided_price:
            price = float(provided_price)
                
        serializer.save(
            user=user,
            start_date=start_date,
            due_date=due_date,
            price=price
        )

    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """Get bookings for the logged-in user"""
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        bookings = Booking.objects.filter(user=request.user)
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        """
        Check if a booking slot is available before proceeding to payment.
        This endpoint should be called before redirecting to payment page.
        For Pool Sessions, checks slot capacity.
        For Events, checks date conflicts.
        """
        booking_type = request.data.get('booking_type')
        date_str = request.data.get('date')
        requested_slots = self._safe_int_conversion(request.data.get('slots'), 1)  # Default to 1 slot

        if not booking_type:
            return Response(
                {"detail": "booking_type is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Skip availability check for memberships and advertisements as they don't have fixed dates/slots
        is_membership = any(x in booking_type for x in ["Membership", "Package", "Advertisement"])
        if is_membership or not date_str:
            if is_membership:
                return Response({
                    "available": True,
                    "booking_type": booking_type,
                    "date": date_str,
                    "message": "Membership/Package available",
                    "available_slots": None
                }, status=status.HTTP_200_OK)
            
            if not date_str:
                return Response(
                    {"detail": "date is required for this booking type"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Check for conflicts (handles both simple conflicts and slot-based for pools and events)
        is_conflict, conflict_message = self._check_booking_conflict(
            booking_type, date_str, requested_slots
        )
        
        # For Pool Sessions, also return available slots count
        available_slots = None
        if booking_type == "Pool Session" and not is_conflict:
            session_time = self._extract_session_time(date_str)
            if session_time and session_time in POOL_SESSION_CAPACITIES:
                capacity = POOL_SESSION_CAPACITIES[session_time]
                normalized_date = self._normalize_date_string(date_str)
                
                # Calculate booked slots
                existing_bookings = Booking.objects.filter(
                    booking_type=booking_type,
                    status__in=['Pending', 'Confirmed', 'Completed']
                )
                
                total_booked_slots = 0
                for booking in existing_bookings:
                    existing_session_time = self._extract_session_time(booking.date)
                    existing_normalized_date = self._normalize_date_string(booking.date)
                    
                    if existing_session_time == session_time and existing_normalized_date == normalized_date:
                        total_booked_slots += booking.slots or 1
                
                available_slots = capacity - total_booked_slots
        
        return Response({
            "available": not is_conflict,
            "booking_type": booking_type,
            "date": date_str,
            "message": conflict_message if is_conflict else (conflict_message or "Slot is available"),
            "available_slots": available_slots  # Only for Pool Sessions
        }, status=status.HTTP_200_OK)

class MenuItemViewSet(viewsets.ModelViewSet):
    """Menu items - Public read, admin write"""
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [IsAdminOrReadOnly]

from django.utils import timezone
from django.db.models import Sum

class OrderViewSet(viewsets.ModelViewSet):
    """Orders - Authenticated can create, admins can manage all"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action == 'my_orders':
            return [IsAuthenticated()]
        elif self.action == 'today_revenue':
            return [IsAdminUser()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        # Auto-assign the logged-in user when creating an order
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """Get orders for the logged-in user"""
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        orders = Order.objects.filter(user=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def today_revenue(self, request):
        """Get total revenue for today (completed orders + confirmed/completed bookings)"""
        from django.utils import timezone
        
        today = timezone.now().date()
        
        # Revenue from completed orders
        orders_revenue = Order.objects.filter(
            created_at__date=today, 
            status='Completed'
        ).aggregate(total=Sum('total_price'))['total'] or 0
        
        # Revenue from confirmed/completed bookings
        bookings_revenue = Booking.objects.filter(
            created_at__date=today,
            status__in=['Confirmed', 'Completed']
        ).aggregate(total=Sum('price'))['total'] or 0
        
        total_revenue = orders_revenue + bookings_revenue
        
        return Response({
            "total": total_revenue,
            "orders_revenue": orders_revenue,
            "bookings_revenue": bookings_revenue
        })

class AdRequestViewSet(viewsets.ModelViewSet):
    """Ad Requests - Public create, admin manage"""
    queryset = AdRequest.objects.all()
    serializer_class = AdRequestSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

class SiteSettingsViewSet(viewsets.ModelViewSet):
    """Site Settings - Admin only"""
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminUser]

# Hardcoded drinks menu (matches frontend drinks.ts) - Updated with actual client data
DEFAULT_DRINKS_MENU = [
    {"id": 1, "name": "Smirnoff", "price": 20, "category": "Drinks", "available": True},
    {"id": 2, "name": "Alvaro", "price": 15, "category": "Drinks", "available": True},
    {"id": 3, "name": "Savana", "price": 30, "category": "Drinks", "available": True},
    {"id": 4, "name": "Guinness", "price": 15, "category": "Drinks", "available": True},
    {"id": 5, "name": "Star", "price": 20, "category": "Drinks", "available": True},
    {"id": 6, "name": "5star", "price": 5, "category": "Drinks", "available": True},
    {"id": 7, "name": "Storm S/S", "price": 5, "category": "Drinks", "available": True},
    {"id": 8, "name": "Gulder", "price": 20, "category": "Drinks", "available": True},
    {"id": 9, "name": "Heineken", "price": 30, "category": "Drinks", "available": True},
    {"id": 10, "name": "Hunters", "price": 30, "category": "Drinks", "available": True},
    {"id": 11, "name": "Vody", "price": 25, "category": "Drinks", "available": True},
    {"id": 12, "name": "Don Simon", "price": 50, "category": "Drinks", "available": True},
    {"id": 13, "name": "Darling", "price": 10, "category": "Drinks", "available": True},
    {"id": 14, "name": "Can Malt", "price": 20, "category": "Drinks", "available": True},
    {"id": 15, "name": "Can Minerals", "price": 15, "category": "Drinks", "available": True},
    {"id": 16, "name": "Wheat B/S", "price": 20, "category": "Drinks", "available": True},
    {"id": 17, "name": "Wheat S/S", "price": 15, "category": "Drinks", "available": True},
    {"id": 18, "name": "Vita Milk", "price": 20, "category": "Drinks", "available": True},
    {"id": 19, "name": "Water S/S", "price": 5, "category": "Drinks", "available": True},
    {"id": 20, "name": "Water M/S", "price": 8, "category": "Drinks", "available": True},
    {"id": 21, "name": "Origin Mini", "price": 15, "category": "Drinks", "available": True},
    {"id": 22, "name": "Sangria", "price": 15, "category": "Drinks", "available": True},
    {"id": 23, "name": "Kiss", "price": 30, "category": "Drinks", "available": True},
    {"id": 24, "name": "Tampico", "price": 15, "category": "Drinks", "available": True},
    {"id": 25, "name": "Afri Bull", "price": 5, "category": "Drinks", "available": True},
    {"id": 26, "name": "B.Malt", "price": 15, "category": "Drinks", "available": True},
    {"id": 27, "name": "Blue Jeans", "price": 25, "category": "Drinks", "available": True},
    {"id": 28, "name": "Eagle", "price": 15, "category": "Drinks", "available": True},
    {"id": 29, "name": "Panache", "price": 15, "category": "Drinks", "available": True},
    {"id": 30, "name": "Jojo", "price": 10, "category": "Drinks", "available": True},
    {"id": 31, "name": "Bullet", "price": 25, "category": "Drinks", "available": True},
    {"id": 32, "name": "Pinna Gin", "price": 15, "category": "Drinks", "available": True},
    {"id": 33, "name": "Beta Malt", "price": 10, "category": "Drinks", "available": True},
    {"id": 34, "name": "Lucozade PET", "price": 25, "category": "Drinks", "available": True},
    {"id": 35, "name": "Lucozade Can", "price": 25, "category": "Drinks", "available": True},
    {"id": 36, "name": "Planet Cocktail", "price": 15, "category": "Drinks", "available": True},
    {"id": 37, "name": "Chips", "price": 5, "category": "Drinks", "available": True},
    {"id": 38, "name": "Mentos Gum", "price": 10, "category": "Drinks", "available": True},
    {"id": 39, "name": "ABC", "price": 15, "category": "Drinks", "available": True},
    {"id": 40, "name": "Stella", "price": 25, "category": "Drinks", "available": True},
    {"id": 41, "name": "Club L/S", "price": 20, "category": "Drinks", "available": True},
    {"id": 42, "name": "Club Mini", "price": 15, "category": "Drinks", "available": True},
    {"id": 43, "name": "Shandy", "price": 20, "category": "Drinks", "available": True},
    {"id": 44, "name": "PET Coke 1.5L", "price": 40, "category": "Drinks", "available": True},
    {"id": 45, "name": "PET Fanta 1.5 Litres", "price": 40, "category": "Drinks", "available": True},
    {"id": 46, "name": "PET Sprite 1.5 L", "price": 40, "category": "Drinks", "available": True},
    {"id": 47, "name": "8pm", "price": 10, "category": "Drinks", "available": True},
    {"id": 48, "name": "Don Simon Can", "price": 20, "category": "Drinks", "available": True},
    {"id": 49, "name": "Red Label S/S", "price": 120, "category": "Drinks", "available": True},
    {"id": 50, "name": "Black Label S/S", "price": 150, "category": "Drinks", "available": True},
    {"id": 51, "name": "Red Label B/S", "price": 450, "category": "Drinks", "available": True},
    {"id": 52, "name": "Black Label B/S", "price": 650, "category": "Drinks", "available": True},
    {"id": 53, "name": "Four Cousins", "price": 150, "category": "Drinks", "available": True},
    {"id": 54, "name": "White Wine", "price": 150, "category": "Drinks", "available": True},
    {"id": 55, "name": "J & B", "price": 80, "category": "Drinks", "available": True},
    {"id": 56, "name": "Cuvee De Baron", "price": 150, "category": "Drinks", "available": True},
    {"id": 57, "name": "Long Mountain", "price": 150, "category": "Drinks", "available": True},
    {"id": 58, "name": "Amarula", "price": 150, "category": "Drinks", "available": True},
    {"id": 59, "name": "Vodka", "price": 300, "category": "Drinks", "available": True},
    {"id": 60, "name": "Champagne", "price": 60, "category": "Drinks", "available": True},
    {"id": 61, "name": "Budweiser", "price": 30, "category": "Drinks", "available": True},
    {"id": 62, "name": "Jagermeister", "price": 150, "category": "Drinks", "available": True},
    {"id": 63, "name": "Ceres", "price": 60, "category": "Drinks", "available": True},
    {"id": 64, "name": "Hollandia Yogurt", "price": 70, "category": "Drinks", "available": True},
    {"id": 65, "name": "Conde De M", "price": 150, "category": "Drinks", "available": True},
    {"id": 66, "name": "Hacienda", "price": 70, "category": "Drinks", "available": True},
    {"id": 67, "name": "Baron R", "price": 150, "category": "Drinks", "available": True},
    {"id": 68, "name": "Quinine Tonic", "price": 15, "category": "Drinks", "available": True},
    {"id": 69, "name": "Nutri Snax Biscuit", "price": 10, "category": "Drinks", "available": True},
    {"id": 70, "name": "BB Cocktail", "price": 15, "category": "Drinks", "available": True},
    {"id": 71, "name": "Origin L/S", "price": 20, "category": "Drinks", "available": True},
    {"id": 73, "name": "Baileys B/S", "price": 300, "category": "Drinks", "available": True},
    {"id": 74, "name": "Baileys S/S", "price": 150, "category": "Drinks", "available": True},
    {"id": 75, "name": "Nederburg", "price": 300, "category": "Drinks", "available": True},
    {"id": 76, "name": "Mosketo", "price": 150, "category": "Drinks", "available": True},
    {"id": 77, "name": "Brutal Fruit", "price": 30, "category": "Drinks", "available": True},
    {"id": 78, "name": "Fan Max", "price": 15, "category": "Drinks", "available": True},
    {"id": 79, "name": "Apple Juice", "price": 35, "category": "Drinks", "available": True},
    {"id": 80, "name": "Arizona Green Tea", "price": 25, "category": "Drinks", "available": True},
    # Spirits
    {"id": 81, "name": "Madingo", "price": 5, "category": "Spirits", "available": True},
    {"id": 82, "name": "Herb Afrik", "price": 5, "category": "Spirits", "available": True},
    {"id": 83, "name": "Alomo Bitters", "price": 5, "category": "Spirits", "available": True},
    {"id": 84, "name": "Amuzu Herbal", "price": 5, "category": "Spirits", "available": True},
    {"id": 85, "name": "De Rayman", "price": 5, "category": "Spirits", "available": True},
    {"id": 86, "name": "Obuase", "price": 5, "category": "Spirits", "available": True},
    {"id": 87, "name": "Ginseng", "price": 5, "category": "Spirits", "available": True},
    {"id": 88, "name": "Black Rock", "price": 5, "category": "Spirits", "available": True},
    {"id": 89, "name": "Origin Bitters", "price": 5, "category": "Spirits", "available": True},
    {"id": 90, "name": "Tonic Wine", "price": 5, "category": "Spirits", "available": True},
    {"id": 91, "name": "Sewa Sachet", "price": 5, "category": "Spirits", "available": True},
    {"id": 92, "name": "Sewa Bottle", "price": 15, "category": "Spirits", "available": True},
    {"id": 93, "name": "After 5", "price": 5, "category": "Spirits", "available": True},
    {"id": 94, "name": "Strawberry", "price": 5, "category": "Spirits", "available": True},
    {"id": 95, "name": "Lime", "price": 5, "category": "Spirits", "available": True},
    {"id": 96, "name": "Castle Bridge", "price": 5, "category": "Spirits", "available": True},
    {"id": 97, "name": "Pastis", "price": 5, "category": "Spirits", "available": True},
]


from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def drinks_menu(request):
    """
    Get drinks menu with admin overrides applied
    Admin can override prices and availability through DrinkOverride model
    """
    # Get all admin overrides
    overrides = DrinkOverride.objects.all()
    override_dict = {override.drink_id: override for override in overrides}
    
    # Apply overrides to default menu
    final_menu = []
    for drink in DEFAULT_DRINKS_MENU:
        drink_data = drink.copy()
        
        # Apply admin override if exists
        if drink['id'] in override_dict:
            override = override_dict[drink['id']]
            drink_data['price'] = float(override.price)
            drink_data['available'] = override.available
            if override.custom_description:
                drink_data['description'] = override.custom_description
            drink_data['admin_overridden'] = True
            drink_data['last_updated'] = override.last_updated.isoformat()
        else:
            drink_data['admin_overridden'] = False
        
        # Add image URL
        drink_data['image'] = f"/drinks/{drink['name'].lower().replace(' ', '-').replace('/', '-')}.jpg"
        
        final_menu.append(drink_data)
    
    return Response(final_menu)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def drink_override(request):
    """
    Create or update a drink override
    """
    drink_id = request.data.get('drink_id')
    price = request.data.get('price')
    available = request.data.get('available', True)
    custom_description = request.data.get('custom_description', '')
    
    # Find the default drink
    default_drink = next((drink for drink in DEFAULT_DRINKS_MENU if drink['id'] == drink_id), None)
    if not default_drink:
        return Response({'error': 'Invalid drink ID'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create or update override
    override, created = DrinkOverride.objects.update_or_create(
        drink_id=drink_id,
        defaults={
            'name': default_drink['name'],
            'price': price,
            'available': available,
            'custom_description': custom_description
        }
    )
    
    return Response({
        'message': 'Drink override saved successfully',
        'drink_id': drink_id,
        'created': created
    })
