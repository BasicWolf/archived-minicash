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

import factory
import random
from decimal import Decimal

from rest_framework.reverse import reverse

from minicash.core.models import Record, SubRecord, Tag
from minicash.core.serializers import (
    RecordSerializer,
    SubRecordSerializer,
    TagSerializer,
)
from minicash.utils.testing import RESTTestCase, permissions_for

from .factories import AssetFactory, RecordFactory, SubRecordFactory, TagFactory


class RecordsAPITest(RESTTestCase):
    def test_smoke(self):
        pass

    def test_list_smoke(self):
        self.assert_success(self.jget(reverse('records-list')))

    def test_list_data(self):
        """Verify the amount of fetched records"""
        RecordFactory.create_batch(10, owner=self.owner)
        res = self.jget(reverse('records-list'))
        self.assert_success(res)
        self.assertEqual(10, len(res.data))

    def test_single_details(self):
        """Verify JSON representation of a single record"""
        record = RecordFactory.create(owner=self.owner)
        res = self.jget(reverse('records-detail', args=[record.pk]))

        self.assert_success(res)

        data = res.data
        self.assertEqual(record.pk, data['pk'])
        self.assertAlmostEqual(record.delta, Decimal(data['delta']), places=2)
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
                'asset_from', 'asset_to', 'created_date', 'delta',
                'description', 'extra', 'mode', 'sub_records', 'tags',
        ])
        res_attributes = frozenset(res.data.keys())
        self.assertEqual(attributes, res_attributes)

    def test_create_full(self):
        asset_to = AssetFactory.create(owner=self.owner)
        asset_from = AssetFactory.create(owner=self.owner)
        record = RecordFactory.build(owner=self.owner, asset_to=asset_to, asset_from=asset_from)
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
        asset_from = AssetFactory.create(owner=self.owner)
        record = RecordFactory.build(owner=self.owner, asset_to=asset_to, asset_from=None)
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

    def test_create_invalid_assets(self):
        record_data = factory.build(dict, FACTORY_CLASS=RecordFactory)
        serializer = RecordSerializer(data=record_data)
        self.assertFalse(serializer.is_valid())

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


class SubRecordsAPITest(RESTTestCase):
    def test_smoke(self):
        pass

    def test_list_smoke(self):
        self.assert_success(self.jget(reverse('sub_records-list')))

    def test_create(self):
        rec = RecordFactory.create(owner=self.owner)
        srec = SubRecordFactory.build(parent_record=rec, owner=self.owner, delta=rec.delta // 2)

        serializer = SubRecordSerializer(srec)
        data_in = serializer.data
        res = self.jpost(reverse('sub_records-list'), data_in)
        self.assert_created(res)
        data_out = res.data

        # pk's are not equal (None vs. PK from database)
        data_in_pk, data_out_pk = data_in.pop('pk'), data_out.pop('pk')
        self.assertNotEqual(data_in_pk, data_out_pk)

        # the rest data is equal
        self.assertEqual(data_in, data_out)

        # ensure internal structure via ORM
        srec_internal = SubRecord.objects.get(pk=data_out_pk)
        self.assertIn(srec_internal, rec.sub_records.all())
        self.assertEqual(1, rec.sub_records.count())

        ser_internal = SubRecordSerializer(srec_internal)
        data_internal = ser_internal.data
        data_internal.pop('pk')
        self.assertEqual(data_out, data_internal)


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
