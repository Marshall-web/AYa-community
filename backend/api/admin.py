from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Booking, MenuItem, Order, AdRequest, SiteSettings, DrinkOverride

# Register your models here.

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'status')
    list_filter = ('role', 'status')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'status')}),
    )

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('guest_name', 'booking_type', 'date', 'slots', 'price', 'status')
    list_filter = ('status', 'booking_type')
    search_fields = ('guest_name',)
    readonly_fields = ('price',)  # Price is calculated automatically

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'status')
    list_filter = ('status', 'category')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'total_price', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('customer_name',)

@admin.register(AdRequest)
class AdRequestAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'slot', 'cost', 'status')
    list_filter = ('status',)
    search_fields = ('business_name',)

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ('site_name', 'maintenance_mode', 'email_notifications')

@admin.register(DrinkOverride)
class DrinkOverrideAdmin(admin.ModelAdmin):
    list_display = ('drink_id', 'name', 'price', 'available', 'last_updated')
    list_filter = ('available', 'last_updated')
    search_fields = ('name',)
    list_editable = ('price', 'available')
    readonly_fields = ('drink_id', 'last_updated')
    
    fieldsets = (
        ('Drink Information', {
            'fields': ('drink_id', 'name')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'available')
        }),
        ('Customization', {
            'fields': ('custom_description',)
        }),
        ('System Info', {
            'fields': ('last_updated',)
        }),
    )
