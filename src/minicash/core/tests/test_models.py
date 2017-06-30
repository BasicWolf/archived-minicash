from minicash.utils.testing import ModelTestCase
from .factories import (AssetFactory, RecordFactory, TagFactory)


class AssetFactoryTest(ModelTestCase):
    def test_smoke(self):
        AssetFactory()

    def test_invalid_value_validator(self):
        asset = AssetFactory(balance=-1)
        self.assertEqual(-1, asset.balance.amount)


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
