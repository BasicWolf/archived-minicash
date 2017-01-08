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
