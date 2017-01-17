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

from django_js_utils.views import jsurls

from . import views

urlpatterns = [
    url(r'^jsurls.js$', jsurls, name='jsurls'),

    url(r'^minicash/', include('minicash.core.urls')),
    url(r'^$', views.index, name='index'),
]
