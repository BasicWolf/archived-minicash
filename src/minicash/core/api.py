from django.conf import settings
from django.db import transaction
from rest_framework import viewsets, pagination, response, status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .models import Record
from .permissions import IsAssetRemovable
from .serializers import (
    RecordSerializer,
    AssetSerializer,
    UpdateAssetSerializer,
    TagSerializer,
)


class RecordsPagination(pagination.PageNumberPagination):
    page_size = settings.MINICASH_DEFAULT_PAGINATOR_PAGE_SIZE
    page_size_query_param = 'page_size'

    def get_paginated_response(self, data):
        return response.Response([
            {
                'links': {
                    'next': self.get_next_link(),
                    'previous': self.get_previous_link()
                },
                'count': self.page.paginator.count,
                'num_pages': self.page.paginator.num_pages,
                'page_size': self.page_size,
            },
            data
        ])


class RecordsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = RecordSerializer
    pagination_class = RecordsPagination

    def get_queryset(self):
        user = self.request.user
        return user.records.all().order_by('-dt_stamp')

    @transaction.atomic
    def perform_create(self, serializer):
        super().perform_create(serializer)
        services.update_asset_from_new_record(serializer.instance)

    @transaction.atomic
    def perform_update(self, serializer):
        old_delta = serializer.instance.delta
        super().perform_update(serializer)
        services.update_asset_from_changed_record(serializer.instance, old_delta)

    @transaction.atomic
    def perform_destroy(self, instance):
        services.update_asset_from_deleted_record(instance)
        super().perform_destroy(instance)


class AssetsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated, IsAssetRemovable,)
    serializer_class = AssetSerializer

    def get_queryset(self):
        user = self.request.user
        return user.assets.all()

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UpdateAssetSerializer
        else:
            return self.serializer_class


class TagsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = TagSerializer

    def get_queryset(self):
        user = self.request.user
        return user.tags.all()
