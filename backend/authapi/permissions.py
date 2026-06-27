from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsReviewer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Reviewer"


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Staff"


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_staff = IsStaff().has_permission(request, view)
        return is_admin or is_staff


class IsAdminOrReviewerOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_reviewer = IsReviewer().has_permission(request, view)
        is_staff = IsStaff().has_permission(request, view)
        return is_admin or is_reviewer or is_staff
