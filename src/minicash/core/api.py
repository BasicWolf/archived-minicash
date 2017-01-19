from rest_framework import viewsets
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated

from .serializers import (
    RecordSerializer,
    AssetSerializer,
    SubRecordSerializer,
    TagSerializer,
)


class RecordsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = RecordSerializer

    def get_queryset(self):
        user = self.request.user
        return user.records.all()


class AssetsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = AssetSerializer

    def get_queryset(self):
        user = self.request.user
        return user.assets.all()


class TagsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = TagSerializer

    def get_queryset(self):
        user = self.request.user
        return user.tags.all()


class SubRecordsView(viewsets.ModelViewSet):
    authentication_classes = (SessionAuthentication, BasicAuthentication)
    permission_classes = (IsAuthenticated,)
    serializer_class = SubRecordSerializer

    def get_queryset(self):
        user = self.request.user
        return user.sub_records.all()
