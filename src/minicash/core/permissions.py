from django.utils.translation import ugettext_lazy as _
from rest_framework import permissions


class IsAssetRemovable(permissions.BasePermission):
    """
    Object-level permission to delete an asset
    only when its records_set is empty.
    """

    message = _('Cannot delete an asset with existing records bound to it.')

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            if obj.to_asset_records.exists() or obj.from_asset_records.exists():
                return False

        return True
