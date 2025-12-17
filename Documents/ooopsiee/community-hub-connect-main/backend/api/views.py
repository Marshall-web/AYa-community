from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings
from .serializers import (
    UserSerializer, BookingSerializer, MenuItemSerializer,
    OrderSerializer, AdRequestSerializer, SiteSettingsSerializer
)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

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
