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
