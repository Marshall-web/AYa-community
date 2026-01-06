from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q, Sum
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings
from .serializers import (
    UserSerializer, BookingSerializer, MenuItemSerializer,
    OrderSerializer, AdRequestSerializer, SiteSettingsSerializer
)

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
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def _normalize_date_string(self, date_str):
        """Normalize date string for comparison - extracts date portion from various formats"""
        if not date_str:
            return ""
        # Remove time and extra details, keep just the date portion
        # Date formats can be like "January 1, 2024" or "January 1, 2024 at 10:00 AM" etc.
        # Extract the date part (before " at " or " | ")
        date_part = date_str.split(" at ")[0].split(" | ")[0].strip()
        return date_part

    def _extract_session_time(self, date_str):
        """Extract session time from date string like 'January 1, 2024 at 6:00 AM - 8:00 AM'"""
        if not date_str:
            return None
        if " at " in date_str:
            return date_str.split(" at ")[1].split(" | ")[0].strip()
        return None

    def _check_booking_conflict(self, booking_type, date_str, requested_slots=1):
        """
        Check if there's a conflicting booking for the same type and date.
        For Pool Sessions, checks if there are enough slots available.
        Returns (is_conflict, message) tuple.
        """
        if not booking_type or not date_str:
            return (False, "")
        
        normalized_date = self._normalize_date_string(date_str)
        if not normalized_date:
            return (False, "")

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

        # For non-pool bookings, use simple conflict check (one booking per slot)
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
        Override create to check for booking conflicts before creating.
        Uses database transaction with locking to prevent race conditions.
        """
        booking_type = request.data.get('booking_type')
        date_str = request.data.get('date')
        requested_slots = int(request.data.get('slots', 1))  # Default to 1 slot

        # Use database transaction to ensure atomicity
        with transaction.atomic():
            # Lock existing bookings for this type to prevent concurrent modifications
            # This prevents race conditions when multiple users book simultaneously
            conflicting_bookings = list(Booking.objects.select_for_update().filter(
                booking_type=booking_type,
                status__in=['Pending', 'Confirmed', 'Completed']
            ))
            
            # Check for conflicts (handles both simple conflicts and slot-based for pools)
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
            
            # If no conflict, proceed with normal creation
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Auto-assign the logged-in user when creating a booking
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

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
        """
        booking_type = request.data.get('booking_type')
        date_str = request.data.get('date')
        requested_slots = int(request.data.get('slots', 1))  # Default to 1 slot

        if not booking_type or not date_str:
            return Response(
                {"detail": "booking_type and date are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for conflicts (handles both simple conflicts and slot-based for pools)
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
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

from django.utils import timezone
from django.db.models import Sum

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

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
        """Get total revenue for today (completed orders only)"""
        today = timezone.now().date()
        revenue = Order.objects.filter(created_at__date=today, status='Completed').aggregate(total=Sum('total_price'))['total'] or 0
        return Response({"total": revenue})

class AdRequestViewSet(viewsets.ModelViewSet):
    queryset = AdRequest.objects.all()
    serializer_class = AdRequestSerializer

class SiteSettingsViewSet(viewsets.ModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
