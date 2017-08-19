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

from .views import RouteView


tabs_urls = [
    url(r'^tabs/records/(?P<id>\w+)?$', RouteView.as_view(), name='tab_records'),
    url(r'^tabs/new_record/(?P<id>[\w]+)?$', RouteView.as_view(), name='tab_new_record'),
    url(r'^tabs/assets/(?P<id>\w+)?$', RouteView.as_view(), name='tab_assets'),
    url(r'^tabs/new_asset/(?P<id>\w+)?$', RouteView.as_view(), name='tab_new_asset'),
    url(r'^tabs/tags/(?P<id>\w+)?$', RouteView.as_view(), name='tab_tags'),
    url(r'^tabs/new_tag/(?P<id>\w+)?$', RouteView.as_view(), name='tab_new_tag'),
    url(r'^tabs/tab_report$', RouteView.as_view(), name='tab_report'),
]


urlpatterns = [
    url(r'^minicash/', include('minicash.core.urls')),

    *tabs_urls,

    url(r'^$', RouteView.as_view(), {'route': '/'}, name='index'),
]
