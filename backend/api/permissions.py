from rest_framework.permissions import BasePermission, IsAuthenticated, SAFE_METHODS


class IsAdminUser(BasePermission):
    """
    Custom permission to only allow admin users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Allows read access to everyone, but write access only to admin users.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission to only allow owners or admins to access/modify.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.role == 'admin' or request.user.is_superuser:
            return True
        # Check if the object has a user field and matches the request user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsAuthenticatedOrReadOnly(BasePermission):
    """
    Allows read access to all, but write access only to authenticated users.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)
