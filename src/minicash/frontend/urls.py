from django.conf.urls import url, include

from django_js_utils.views import jsurls

from . import views

urlpatterns = [
    url(r'^jsurls.js$', jsurls, name='jsurls'),

    url(r'^minicash/', include('minicash.core.urls')),
    url(r'^$', views.index, name='index'),
]
