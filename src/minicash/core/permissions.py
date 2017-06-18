from rest_framework import permissions


class IsAssetRemovable(permissions.BasePermission):
    """
    Object-level permission to delete an asset
    only when its records_set is empty.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE' and not obj.to_asset_records.exists():
            return False

        return True
