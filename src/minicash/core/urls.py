from django.conf.urls import url, include

from rest_framework.routers import DefaultRouter

from . import api


router = DefaultRouter()

# router.register(base_name, viewset, base_name)
router.register('records', api.PaginatedRecordsView, 'records')
router.register('assets', api.AssetsView, 'assets')
router.register('tags', api.TagsView, 'tags')


urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^mass-delete/records/$', api.RecordsDeleteView.as_view(), name='records-mass-delete'),
    url(r'^mass-delete/tags/$', api.TagsDeleteView.as_view(), name='tags-mass-delete'),
]
