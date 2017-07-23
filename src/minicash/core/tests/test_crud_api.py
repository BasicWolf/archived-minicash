import random

from moneyed import Money

from django.test import RequestFactory
from rest_framework import status
from rest_framework.reverse import reverse

from minicash.core.models import Asset, Record, Tag
from minicash.core.serializers import (
    AssetSerializer,
    RecordSerializer,
    TagSerializer,
)
from minicash.utils.testing import RESTTestCase
from .factories import AssetFactory, RecordFactory, TagFactory


class RecordsAPICRUDTest(RESTTestCase):
    def test_smoke(self):
        pass

    def test_list_smoke(self):
        self.assert_success(self.jget(reverse('records-list')))

    def test_list_data(self):
        """Verify the amount of fetched records"""
        RecordFactory.create_batch(10, owner=self.owner)
        res = self.jget(reverse('records-list'))
        self.assert_success(res)
        pagination_details, records_data = res.data
        self.assertEqual(10, len(records_data))
        self.assertEqual(10, pagination_details['count'])

    def test_single_details(self):
        """Verify JSON representation of a single record"""
        record = RecordFactory.create(owner=self.owner)
        res = self.jget(reverse('records-detail', args=[record.pk]))
        currency = record.delta.currency

        self.assert_success(res)

        data = res.data
        self.assertEqual(record.pk, data['pk'])
        self.assertAlmostEqual(record.delta, Money(data['delta'], currency), places=2)
        self.assertEqual(record.mode, data['mode'])
        self.assertEqual(record.description, data['description'])
        self.assertEqual(list(record.tags.all().values_list('name', flat=True)),
                         data['tags'])
        self.assertEqual(record.asset_to.pk, data['asset_to'])
        self.assertEqual(record.asset_from.pk, data['asset_from'])
        self.assertEqual(record.extra, data['extra'])

    def test_single_attributes(self):
        """Test which attributes of a Record instance are serialized"""
        record = RecordFactory.create(owner=self.owner)
        res = self.jget(reverse('records-detail', args=[record.pk]))

        self.assert_success(res)

        attributes = frozenset([
            'pk',
            'asset_from', 'asset_to', 'created_dt', 'delta',
            'description', 'extra', 'mode', 'tags',
        ])
        res_attributes = frozenset(res.data.keys())
        self.assertEqual(attributes, res_attributes)

    def test_create_full(self):
        asset_to = AssetFactory.create(owner=self.owner)
        asset_from = AssetFactory.create(owner=self.owner)
        record = RecordFactory.build(asset_to=asset_to, asset_from=asset_from, owner=self.owner)
        serializer = RecordSerializer(record)

        # add a list of tags
        tags = TagFactory.build_batch(3)
        data_in = serializer.data
        data_in['tags'] = [tag.name for tag in tags]

        res = self.jpost(reverse('records-list'), data_in)
        self.assert_created(res)
        self._compare_records_data(data_in, res.data)

    def test_create_asset_partial(self):
        asset_to = AssetFactory.create(owner=self.owner)
        record = RecordFactory.build(asset_to=asset_to, asset_from=None, owner=self.owner)
        serializer = RecordSerializer(record)

        data_in = serializer.data
        res = self.jpost(reverse('records-list'), data_in)
        self.assert_created(res)
        self._compare_records_data(data_in, res.data)

    def test_update(self):
        record = RecordFactory.create(owner=self.owner)
        record.delta = random.randint(0, 1000)
        serializer = RecordSerializer(record)
        res = self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)
        self.assert_updated(res)

    def test_create_empty_data_with_context(self):
        req = RequestFactory()
        req.user = self.owner
        record_data = {}
        serializer = RecordSerializer(data=record_data, context={'request': req})
        self.assertFalse(serializer.is_valid())

    def test_create_invalid_mode(self):
        asset_to = AssetFactory.create(owner=self.owner)
        asset_from = AssetFactory.create(owner=self.owner)

        record = RecordFactory.build(asset_to=asset_to, mode=Record.TRANSFER, owner=self.owner)
        res = self.jpost(reverse('records-list'), RecordSerializer(record).data)
        self.assert_bad(res)

        record = RecordFactory.build(asset_to=asset_to, mode=Record.EXPENSE, owner=self.owner)
        res = self.jpost(reverse('records-list'), RecordSerializer(record).data)
        self.assert_bad(res)

        record = RecordFactory.build(asset_from=asset_from, mode=Record.TRANSFER, owner=self.owner)
        res = self.jpost(reverse('records-list'), RecordSerializer(record).data)
        self.assert_bad(res)

        record = RecordFactory.build(asset_from=asset_from, mode=Record.INCOME, owner=self.owner)
        res = self.jpost(reverse('records-list'), RecordSerializer(record).data)
        self.assert_bad(res)

    def _compare_records_data(self, data_in, data_out):
        # pk's are not equal (None vs. PK from database)
        data_in_pk, data_out_pk = data_in.pop('pk'), data_out.pop('pk')
        self.assertNotEqual(data_in_pk, data_out_pk)

        # the rest data is equal
        self.assertEqual(data_in, data_out)

        # ensure internal structure via ORM
        rec_internal = Record.objects.get(pk=data_out_pk)

        ser_internal = RecordSerializer(rec_internal)
        data_internal = ser_internal.data
        data_internal.pop('pk')
        self.assertEqual(data_out, data_internal)


class AssetAPITest(RESTTestCase):
    def test_smoke(self):
        pass

    def test_list_smoke(self):
        self.assert_success(self.jget(reverse('assets-list')))

    def test_list_data(self):
        """Verify the amount of fetched records"""
        AssetFactory.create_batch(5, owner=self.owner)

        res = self.jget(reverse('assets-list'))
        self.assert_success(res)
        self.assertNotEqual(0, len(res.data))
        self.assertGreaterEqual(5, len(res.data))

    def test_create(self):
        asset = AssetFactory.build(owner=self.owner)
        serializer = AssetSerializer(asset)
        data_in = serializer.data
        res = self.jpost(reverse('assets-list'), data_in)
        self.assert_created(res)
        data_out = res.data

        # pk's are not equal (None vs. PK from database)
        data_in_pk, data_out_pk = data_in.pop('pk'), data_out.pop('pk')
        self.assertNotEqual(data_in_pk, data_out_pk)

        # the rest data is equal
        self.assertEqual(data_in, data_out)

        # ensure internal structure via ORM
        asset_internal = Asset.objects.get(pk=data_out_pk)
        ser_internal = AssetSerializer(asset_internal)
        data_internal = ser_internal.data
        data_internal.pop('pk')
        self.assertEqual(data_out, data_internal)

        # ensure initial balance value
        self.assertEqual(asset_internal.balance, asset_internal.initial_balance)

    def test_update(self):
        asset = AssetFactory.create(owner=self.owner)
        serializer = AssetSerializer(asset)
        data_in = serializer.data
        self.assertIn('balance', data_in)

        res = self.jpatch(reverse('assets-detail', args=[asset.pk]), data_in)
        data_out = res.data
        self.assertNotIn('balance', data_out)
        self.assertEqual(data_in['balance'], str(Asset.objects.get(pk=data_in['pk']).balance.amount))

    def test_delete_empty(self):
        asset = AssetFactory.create(owner=self.owner)
        self.jdelete(reverse('assets-detail', args=[asset.pk]))
        self.assertFalse(Asset.objects.filter(pk=asset.pk).exists())

    def test_delete_with_records(self):
        asset = AssetFactory.create(owner=self.owner)
        RecordFactory.create(asset_from=asset, mode=Record.INCOME, owner=self.owner)

        res = self.jdelete(reverse('assets-detail', args=[asset.pk]))
        self.assertEqual(status.HTTP_403_FORBIDDEN, res.status_code)
        self.assertTrue(Asset.objects.filter(pk=asset.pk).exists())


class TagsAPITest(RESTTestCase):
    def test_smoke(self):
        pass

    def test_list_smoke(self):
        self.assert_success(self.jget(reverse('tags-list')))

    def test_create(self):
        tag = TagFactory.build(owner=self.owner)
        serializer = TagSerializer(tag)
        data_in = serializer.data
        res = self.jpost(reverse('tags-list'), data_in)
        self.assert_created(res)
        data_out = res.data

        # pk's are not equal (None vs. PK from database)
        data_in_pk, data_out_pk = data_in.pop('pk'), data_out.pop('pk')
        self.assertNotEqual(data_in_pk, data_out_pk)

        # the rest data is equal
        self.assertEqual(data_in, data_out)

        # ensure internal structure via ORM
        tag_internal = Tag.objects.get(pk=data_out_pk)
        ser_internal = TagSerializer(tag_internal)
        data_internal = ser_internal.data
        data_internal.pop('pk')
        self.assertEqual(data_out, data_internal)

    def test_create_invalid_name(self):
        tag = TagFactory.build(name='abc,cde', owner=self.owner)
        res = self.jpost(reverse('tags-list'), TagSerializer(tag).data)
        self.assert_bad(res)