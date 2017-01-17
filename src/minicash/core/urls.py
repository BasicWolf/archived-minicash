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

from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter

from . import api


router = DefaultRouter()

# router.register(base_name, viewset, base_name)
router.register('records', api.RecordsView, 'records')
router.register('assets', api.AssetsView, 'assets')
router.register('tags', api.TagsView, 'tags')
router.register('sub_records', api.SubRecordsView, 'sub_records')


urlpatterns = [
    url(r'^', include(router.urls)),
]
