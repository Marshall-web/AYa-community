from rest_framework import serializers
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'role', 'status']

class BookingSerializer(serializers.ModelSerializer):
    # For reading (output), we'll rename fields to match frontend
    # For writing (input), we accept the actual model field names
    
    class Meta:
        model = Booking
        fields = ['id', 'guest_name', 'booking_type', 'date', 'status', 'user', 'slots']
        extra_kwargs = {'user': {'required': False}, 'slots': {'required': False}}
    
    def to_representation(self, instance):
        """Customize output to match frontend expectations"""
        data = super().to_representation(instance)
        # Rename fields for frontend
        data['guest'] = data.pop('guest_name')
        data['type'] = data.pop('booking_type')
        return data

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'items', 'total_price', 'status', 'user', 'created_at']
        extra_kwargs = {'user': {'required': False}}
    
    def to_representation(self, instance):
        """Customize output to match frontend expectations"""
        data = super().to_representation(instance)
        # Rename fields for frontend
        data['customer'] = data.pop('customer_name')
        data['total'] = data.pop('total_price')
        return data

class AdRequestSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AdRequest
        fields = ['id', 'business_name', 'slot', 'cost', 'status']
    
    def to_representation(self, instance):
        """Customize output to match frontend expectations"""
        data = super().to_representation(instance)
        data['business'] = data.pop('business_name')
        return data

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'
