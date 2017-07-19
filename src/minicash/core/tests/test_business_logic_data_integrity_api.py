import random

from rest_framework.reverse import reverse

from minicash.core.serializers import (
    AssetSerializer,
    RecordSerializer,
    TagSerializer,
)
from minicash.core.models import Asset, Record, Tag
from minicash.utils.testing import RESTTestCase
from .factories import AssetFactory, RecordFactory, TagFactory


class RecordAPIAssetDataIntegrityTest(RESTTestCase):
    def test_expnese_record_created_asset_updated(self):
        asset_from = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_from.balance
        record = RecordFactory.build(asset_from=asset_from, asset_to=None, owner=self.owner)
        serializer = RecordSerializer(record)

        self.jpost(reverse('records-list'), serializer.data)

        asset_from.refresh_from_db()
        new_asset_balance = asset_from.balance
        self.assertEqual(new_asset_balance,
                         old_asset_balance - record.delta)

    def test_income_record_created_asset_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_to.balance
        record = RecordFactory.build(asset_to=asset_to, asset_from=None, owner=self.owner)

        serializer = RecordSerializer(record)
        self.jpost(reverse('records-list'), serializer.data)

        asset_to.refresh_from_db()
        new_asset_balance = asset_to.balance
        self.assertEqual(new_asset_balance,
                         old_asset_balance + record.delta)

    def test_transfer_record_created_assets_updated(self):
        asset_from = AssetFactory.create(name='AST1', owner=self.owner)
        asset_to = AssetFactory.create(name='AST2', owner=self.owner)
        old_asset_from_balance = asset_from.balance
        old_asset_to_balance = asset_to.balance
        record = RecordFactory.build(asset_from=asset_from, asset_to=asset_to, owner=self.owner)
        serializer = RecordSerializer(record)

        self.jpost(reverse('records-list'), serializer.data)

        asset_to.refresh_from_db()
        asset_from.refresh_from_db()
        new_asset_from_balance = asset_from.balance
        new_asset_to_balance = asset_to.balance

        self.assertEqual(new_asset_from_balance,
                         old_asset_from_balance - record.delta)
        self.assertEqual(new_asset_to_balance,
                         old_asset_to_balance + record.delta)

    def test_expense_record_balance_updated_asset_updated(self):
        asset_from = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_from.balance

        record = RecordFactory.create(asset_from=asset_from, asset_to=None, owner=self.owner)
        old_record_delta = record.delta

        new_record_delta = random.randint(0, 1000)
        record.delta = new_record_delta
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_from.refresh_from_db()
        new_asset_balance = asset_from.balance
        new_record_delta = record.delta

        self.assertEqual(new_asset_balance,
                         old_asset_balance + old_record_delta - new_record_delta)

    def test_expense_record_assets_updated_asset_balance_updated(self):
        asset_from = AssetFactory.create(owner=self.owner)
        asset_from_other = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_from.balance
        old_asset_other_balance = asset_from_other.balance

        record = RecordFactory.create(asset_from=asset_from, asset_to=None, owner=self.owner)
        record.asset_from = asset_from_other
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_from.refresh_from_db()
        asset_from_other.refresh_from_db()

        self.assertEqual(asset_from.balance, old_asset_balance + record.delta)
        self.assertEqual(asset_from_other.balance, old_asset_other_balance - record.delta)

    def test_income_record_updated_asset_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_to.balance

        record = RecordFactory.create(asset_to=asset_to, asset_from=None, owner=self.owner)
        old_record_delta = record.delta

        new_record_delta = random.randint(0, 1000)
        record.delta = new_record_delta
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_to.refresh_from_db()
        new_asset_balance = asset_to.balance
        new_record_delta = record.delta

        self.assertEqual(new_asset_balance,
                         old_asset_balance - old_record_delta + new_record_delta)

    def test_income_record_assets_updated_asset_balance_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        asset_to_other = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_to.balance
        old_asset_other_balance = asset_to_other.balance

        record = RecordFactory.create(asset_to=asset_to, asset_from=None, owner=self.owner)
        record.asset_to = asset_to_other
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_to.refresh_from_db()
        asset_to_other.refresh_from_db()
        self.assertEqual(asset_to.balance, old_asset_balance - record.delta)
        self.assertEqual(asset_to_other.balance, old_asset_other_balance + record.delta)

    def test_transfer_record_updated_assets_updated(self):
        asset_from = AssetFactory.create(name='AST1', owner=self.owner)
        asset_to = AssetFactory.create(name='AST2', owner=self.owner)

        old_asset_from_balance = asset_from.balance
        old_asset_to_balance = asset_to.balance
        record = RecordFactory.create(asset_from=asset_from, asset_to=asset_to, owner=self.owner)
        old_record_delta = record.delta

        new_record_delta = random.randint(0, 1000)
        record.delta = new_record_delta
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_to.refresh_from_db()
        asset_from.refresh_from_db()
        new_asset_from_balance = asset_from.balance
        new_asset_to_balance = asset_to.balance
        new_record_delta = record.delta

        self.assertEqual(new_asset_from_balance,
                         old_asset_from_balance + old_record_delta - new_record_delta)
        self.assertEqual(new_asset_to_balance,
                         old_asset_to_balance - old_record_delta + new_record_delta)

    def test_transfer_record_updated_assets_balance_updated(self):
        asset_from = AssetFactory.create(name='AST1', owner=self.owner)
        asset_to = AssetFactory.create(name='AST2', owner=self.owner)
        asset_from_other = AssetFactory.create(name='AST1-O', owner=self.owner)
        asset_to_other = AssetFactory.create(name='AST2-O', owner=self.owner)

        old_asset_from_balance = asset_from.balance
        old_asset_to_balance = asset_to.balance
        old_asset_from_other_balance = asset_from_other.balance
        old_asset_to_other_balance = asset_to_other.balance

        record = RecordFactory.create(asset_from=asset_from,
                                      asset_to=asset_to,
                                      owner=self.owner)
        record.asset_to = asset_to_other
        record.asset_from = asset_from_other
        serializer = RecordSerializer(record)

        self.jpatch(reverse('records-detail', args=[record.pk]), serializer.data)

        asset_to.refresh_from_db()
        asset_from.refresh_from_db()
        asset_to_other.refresh_from_db()
        asset_from_other.refresh_from_db()

        self.assertEqual(asset_from.balance,
                         old_asset_from_balance + record.delta)
        self.assertEqual(asset_from_other.balance,
                         old_asset_from_other_balance - record.delta)
        self.assertEqual(asset_to.balance,
                         old_asset_to_balance - record.delta)
        self.assertEqual(asset_to_other.balance,
                         old_asset_to_other_balance + record.delta)

    def test_expense_record_deleted_asset_updated(self):
        asset_from = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_from.balance

        record = RecordFactory.create(asset_from=asset_from, asset_to=None, owner=self.owner)
        old_record_delta = record.delta

        self.jdelete(reverse('records-detail', args=[record.pk]))

        asset_from.refresh_from_db()
        new_asset_balance = asset_from.balance

        self.assertEqual(new_asset_balance, old_asset_balance + old_record_delta)

    def test_income_record_deleted_asset_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_to.balance

        record = RecordFactory.create(asset_to=asset_to, asset_from=None, owner=self.owner)
        old_record_delta = record.delta

        self.jdelete(reverse('records-detail', args=[record.pk]))
        asset_to.refresh_from_db()
        new_asset_balance = asset_to.balance

        self.assertEqual(new_asset_balance, old_asset_balance - old_record_delta)

    def test_transfer_record_deleted_assets_updated(self):
        asset_from = AssetFactory.create(name='AST1', owner=self.owner)
        asset_to = AssetFactory.create(name='AST2', owner=self.owner)

        old_asset_from_balance = asset_from.balance
        old_asset_to_balance = asset_to.balance
        record = RecordFactory.create(asset_from=asset_from, asset_to=asset_to, owner=self.owner)

        self.jdelete(reverse('records-detail', args=[record.pk]))

        asset_to.refresh_from_db()
        asset_from.refresh_from_db()
        new_asset_from_balance = asset_from.balance
        new_asset_to_balance = asset_to.balance
        new_record_delta = record.delta

        self.assertEqual(new_asset_from_balance,
                         old_asset_from_balance + new_record_delta)
        self.assertEqual(new_asset_to_balance,
                         old_asset_to_balance - new_record_delta)


class RecordAPITagsDataIntegrityTest(RESTTestCase):
    def test_record_created_tags_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        _tags = TagFactory.build_batch(3)
        tags_names = [tag.name for tag in _tags]

        # Create 5 records with same tags and verify that counters get updated
        for i in range(1, 6):
            record = RecordFactory.build(asset_to=asset_to, asset_from=None,
                                         owner=self.owner)
            data_in = RecordSerializer(record).data
            data_in['tags'] = tags_names
            res = self.jpost(reverse('records-list'), data_in)

            rec = Record.objects.get(pk=res.data['pk'])
            for tag in rec.tags.all():
                self.assertEqual(i, tag.records_count)

    def test_record_updated_tags_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        tags = TagFactory.create_batch(5, records_count=1)
        tags_names = [tag.name for tag in tags]

        record = RecordFactory.create(tags=tags, asset_to=asset_to, asset_from=None,
                                      owner=self.owner)
        data_in = RecordSerializer(record).data

        # update record, remove tags, keep two tags
        data_in['tags'] = tags_names[:2]
        self.jpatch(reverse('records-detail', args=[record.pk]), data_in)
        record.refresh_from_db()
        self.assertEqual(2, record.tags.count())

        # update record, add new tags
        data_in['tags'] = tags_names[:2] + ['hello_001', 'world_002']
        self.jpatch(reverse('records-detail', args=[record.pk]), data_in)
        record.refresh_from_db()
        self.assertEqual(4, record.tags.count())

    def test_record_deleted_tags_updated(self):
        RECORDS_TO_CREATE = 10
        RECORDS_TO_REMOVE = 3

        asset_to = AssetFactory.create(owner=self.owner)
        tags = TagFactory.create_batch(5, owner=self.owner)
        tags_names = [tag.name for tag in tags]

        # Create 10 records with same tags
        for i in range(RECORDS_TO_CREATE):
            record = RecordFactory.build(asset_to=asset_to, asset_from=None,
                                         owner=self.owner)
            data_in = RecordSerializer(record).data
            data_in['tags'] = tags_names
            res = self.jpost(reverse('records-list'), data_in)

        # Remove 3 records, verify tags updated
        records_to_remove = Record.objects.all()[:RECORDS_TO_REMOVE]
        for rec in records_to_remove:
            self.jdelete(reverse('records-detail', args=[rec.pk]))

        for tag in tags:
            tag.refresh_from_db()
            self.assertEqual(tag.records_count, RECORDS_TO_CREATE - RECORDS_TO_REMOVE)
