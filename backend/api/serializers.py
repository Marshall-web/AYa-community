from rest_framework import serializers
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings
from .validators import sanitize_text, validate_name, validate_positive_number

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'role', 'status']
        read_only_fields = ['id', 'role']  # Prevent role modification via API

class BookingSerializer(serializers.ModelSerializer):
    # For reading (output), we'll rename fields to match frontend
    # For writing (input), we accept the actual model field names
    
    class Meta:
        model = Booking
        fields = ['id', 'guest_name', 'email', 'booking_type', 'date', 'status', 'user', 'slots', 'start_date', 'due_date', 'price']
        extra_kwargs = {'user': {'required': False}, 'slots': {'required': False}, 'price': {'required': False}, 'email': {'required': False}}
    
    def validate_guest_name(self, value):
        """Validate and sanitize guest name"""
        if value:
            return sanitize_text(value, max_length=100)
        return value
    
    def validate_booking_type(self, value):
        """Validate and sanitize booking type"""
        if value:
            return sanitize_text(value, max_length=100)
        return value
    
    def validate_slots(self, value):
        """Validate slots is a positive integer"""
        if value is not None:
            if value < 1:
                raise serializers.ValidationError("Slots must be at least 1.")
            if value > 100:
                raise serializers.ValidationError("Slots cannot exceed 100.")
        return value
    
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
    
    def validate_name(self, value):
        """Validate and sanitize menu item name"""
        if value:
            return sanitize_text(value, max_length=100)
        return value
    
    def validate_description(self, value):
        """Validate and sanitize description"""
        if value:
            return sanitize_text(value, max_length=500)
        return value
    
    def validate_price(self, value):
        """Validate price is positive"""
        if value < 0:
            raise serializers.ValidationError("Price must be a positive number.")
        return value

class OrderSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Order
        fields = ['id', 'customer_name', 'items', 'total_price', 'status', 'user', 'created_at']
        extra_kwargs = {'user': {'required': False}}
    
    def validate_customer_name(self, value):
        """Validate and sanitize customer name"""
        if value:
            return sanitize_text(value, max_length=100)
        return value
    
    def validate_items(self, value):
        """Validate and sanitize items string"""
        if value:
            return sanitize_text(value, max_length=2000)
        return value
    
    def validate_total_price(self, value):
        """Validate total price is positive"""
        if value < 0:
            raise serializers.ValidationError("Total price must be a positive number.")
        return value
    
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
    
    def validate_business_name(self, value):
        """Validate and sanitize business name"""
        if value:
            return sanitize_text(value, max_length=200)
        return value
    
    def validate_slot(self, value):
        """Validate and sanitize slot info"""
        if value:
            return sanitize_text(value, max_length=200)
        return value
    
    def validate_cost(self, value):
        """Validate cost is positive"""
        if value < 0:
            raise serializers.ValidationError("Cost must be a positive number.")
        return value
    
    def to_representation(self, instance):
        """Customize output to match frontend expectations"""
        data = super().to_representation(instance)
        data['business'] = data.pop('business_name')
        return data

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

