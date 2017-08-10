from behave import given, when, then

from django.contrib.auth import get_user_model

from minicash.core.models import Asset

@given(u'assets')
def create_assets(context):
    for item in context.items:
        item['owner'] = get_user_model().objects.get(pk=item['owner'])
        Asset.objects.create(**item)

