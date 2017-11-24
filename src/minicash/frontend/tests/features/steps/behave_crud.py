from moneyed import Money

from behave import given, then

from django.contrib.auth import get_user_model

from minicash.core.models import Asset, Record, Tag
from minicash.core.serializers import CreateRecordSerializer
from minicash.core.tests.factories import AssetFactory, RecordFactory


@given('clear assets')
def clear_assets(context):
    Asset.objects.all().delete()


@given('assets')
def create_assets(context):
    for item in context.items:
        item['owner'] = get_user_model().objects.get(pk=item['owner'])
        Asset.objects.create(**item)


@given('tags')
def create_tags(context):
    for item in context.items:
        item['owner'] = get_user_model().objects.get(pk=item['owner'])
        Tag.objects.create(**item)


@given('records')
def create_records(context):
    for item in context.items:
        # extract Many-to-many related tags to add after an object is created
        tags = item.pop('tags', '').split(' ')

        r = Record()
        r.owner = get_user_model().objects.get(pk=item['owner'])
        r.mode = getattr(Record, item['mode'])

        if 'asset_from' in item:
            r.asset_from = Asset.objects.get(pk=item['asset_from'])

        r.created_dt = item['created_dt']
        r.delta = item['delta']
        r.description = item['description']
        r.save()

        for tag_name in tags:
            tag = Tag.objects.for_owner(r.owner).get_or_create(name=tag_name, owner=r.owner)
            r.tags_set.add(tag)


@given('{count:int} random records')
def create_random_records(context, count):
    user = get_user_model().objects.all()[0]
    asset_from = AssetFactory()
    RecordFactory.create_batch(count, owner=user, asset_from=asset_from)


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
    test.assertEqual(Money(item['delta'], currency), record.delta)
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
    test.assertEqual(Money(item['balance'], currency), asset.balance)


@then('tag exists on the backend')
def step_tags_exists_on_backend(context):
    test = context.test
    item = context.item
    if 'pk' in item:
        q = {'pk': item['pk']}
    else:
        q = {'name': item['name'], 'owner': item['owner']}
    test.assertTrue(Tag.objects.filter(**q).exists())


@then('tags count on the backend is {tags_count}')
def step_tags_count_on_backend(context, tags_count):
    tags_count = int(tags_count)
    test = context.test
    test.assertEqual(tags_count, Tag.objects.all().count())
