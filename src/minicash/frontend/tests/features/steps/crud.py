from moneyed import Money

from behave import given, then

from django.contrib.auth import get_user_model

from minicash.core.models import Asset, Record


@given(u'assets')
def create_assets(context):
    for item in context.items:
        item['owner'] = get_user_model().objects.get(pk=item['owner'])
        Asset.objects.create(**item)


@then('record exist on the backend')
def step_records_exists_on_backend(context):
    test = context.test
    item = context.item
    if 'pk' in item:
        q = {'pk': item['pk']}
    else:
        q = {'description': item['description']}
    record = Record.objects.get(**q)
    test.assertEqual(getattr(Record, item['mode']), record.mode)
    test.assertEqual(item['created_dt'],
                     record.created_dt.strftime(context.user.profile.date_time_format))
    currency = record.delta.currency
    test.assertAlmostEqual(Money(item['delta'], currency), record.delta, places=2)
    test.assertEqual(item['tags'], ' '.join(tag.name for tag in record.tags.all()))


@then('asset exists on the backend')
def step_asset_exists_on_backend(context):
    test = context.test
    item = context.item
    if 'pk' in item:
        q = {'pk': item['pk']}
    else:
        q = {'description': item['description']}
    asset = Asset.objects.get(**q)
    currency = asset.balance.currency
    test.assertAlmostEqual(Money(item['balance'], currency), asset.balance, places=2)
