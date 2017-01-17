#    Copyright (C) 2017 Zaur Nasibov and contributors
#
#    This file is part of Minicash.

#    Minicash is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    Foobar is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

#    You should have received a copy of the GNU General Public License
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
