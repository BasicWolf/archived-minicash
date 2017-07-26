import random

from rest_framework.reverse import reverse

from minicash.core.serializers import (
    CreateRecordSerializer,
)
from minicash.utils.testing import RESTTestCase
from .factories import AssetFactory, RecordFactory


class RecordAPIAssetDataIntegrityTest(RESTTestCase):
    def test_expnese_record_created_asset_updated(self):
        asset_from = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_from.balance
        record = RecordFactory.build(asset_from=asset_from, asset_to=None, owner=self.owner)
        serializer = CreateRecordSerializer(record)

        self.jpost(reverse('records-list'), serializer.data)

        asset_from.refresh_from_db()
        new_asset_balance = asset_from.balance
        self.assertEqual(new_asset_balance,
                         old_asset_balance - record.delta)

    def test_income_record_created_asset_updated(self):
        asset_to = AssetFactory.create(owner=self.owner)
        old_asset_balance = asset_to.balance
        record = RecordFactory.build(asset_to=asset_to, asset_from=None, owner=self.owner)

        serializer = CreateRecordSerializer(record)
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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
        serializer = CreateRecordSerializer(record)

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
