from rest_framework import permissions


class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access the view.
    """
    message = "Only admin users can perform this action."
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type == 'admin'