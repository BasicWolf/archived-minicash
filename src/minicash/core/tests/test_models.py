from minicash.core.models import SubRecord
from minicash.utils.testing import ModelTestCase
from .factories import (AssetFactory, RecordFactory, SubRecordFactory,
                        TagFactory)


class AssetFactoryTest(ModelTestCase):
    def test_smoke(self):
        AssetFactory()

    def test_invalid_value_validator(self):
        asset = AssetFactory(saldo=-1)
        self.assertEqual(-1, asset.saldo)


class TagFactoryTest(ModelTestCase):
    def test_smoke(self):
        TagFactory()


class RecordFactoryTest(ModelTestCase):
    def test_smoke(self):
        RecordFactory()

    def test_mode_based_on_asset(self):
        asset_to = AssetFactory()
        asset_from = AssetFactory()

        record = RecordFactory(asset_to=asset_to, asset_from=asset_from)
        self.assertEqual(record.TRANSFER, record.mode)

        record = RecordFactory(asset_to=asset_to, asset_from=None)
        self.assertEqual(record.INCOME, record.mode)

        record = RecordFactory(asset_to=None, asset_from=asset_from)
        self.assertEqual(record.EXPENSE, record.mode)


class SubRecordFactoryTest(ModelTestCase):
    def test_smoke(self):
        SubRecordFactory()

    def test_create(self):
        pr = RecordFactory.create()
        sr = SubRecord(delta=10, parent_record=pr, owner=self.owner)
        sr.save()
