from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, BookingViewSet, MenuItemViewSet,
    OrderViewSet, AdRequestViewSet, SiteSettingsViewSet
)
from .auth_views import login_view, logout_view, register_view, current_user_view

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'menu-items', MenuItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'ad-requests', AdRequestViewSet)
router.register(r'settings', SiteSettingsViewSet)

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/register/', register_view, name='register'),
    path('auth/me/', current_user_view, name='current-user'),
    path('', include(router.urls)),
]
