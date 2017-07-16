import datetime
from urllib.parse import urlencode

from rest_framework.reverse import reverse

from minicash.core.models import Record
from minicash.utils.testing import RESTTestCase
from .factories import AssetFactory, RecordFactory, TagFactory


class FilterTestCaseMixin:
    def assert_res_count(self, count, q):
        res = self.jget(reverse('records-list'), q)

        pagination_details, records_data = res.data

        self.assertEqual(count, len(records_data))
        self.assertEqual(count, pagination_details['count'])


class RecordsFilterCreatedDTTest(FilterTestCaseMixin, RESTTestCase):
    def setUp(self):
        super().setUp()

        self.now = datetime.datetime.now(datetime.timezone.utc)
        self.tomorrow = self.now + datetime.timedelta(days=1)
        self.before_yesterday = (self.now - datetime.timedelta(days=2))
        self.yesterday = self.now - datetime.timedelta(days=1)
        self.after_tomorrow = self.now + datetime.timedelta(days=2)

        RecordFactory.create_batch(5, created_dt=self.now, owner=self.owner)
        RecordFactory.create_batch(4, created_dt=self.yesterday, owner=self.owner)
        RecordFactory.create_batch(3, created_dt=self.tomorrow, owner=self.owner)

    def tearDown(self):
        super().tearDown()
        Record.objects.all().delete()

    # pylint: disable=arguments-differ
    def jget(self, url, q, *args, **kwargs):
        qargs = urlencode(q)
        qurl = f'{url}?{qargs}'
        return super().jget(qurl, *args, **kwargs)

    def test_filter_created_dt_between_minutes(self):
        minute_ago = self.now - datetime.timedelta(minutes=1)
        minute_later = self.now + datetime.timedelta(minutes=1)

        q_today = {
            'dt_from': minute_ago.strftime('%Y-%m-%d %H:%M'),
            'dt_to': minute_later.strftime('%Y-%m-%d %H:%M'),
        }

        self.assert_res_count(5, q_today)

    def test_filter_created_dt_from_bound(self):
        minute_later = self.now + datetime.timedelta(minutes=1)

        q_today = {
            'dt_from': self.before_yesterday.strftime('%Y-%m-%d %H:%M'),
            'dt_to': minute_later.strftime('%Y-%m-%d %H:%M'),
        }

        self.assert_res_count(9, q_today)

    def test_filter_created_dt_to_bound(self):
        q_today = {
            'dt_from': self.now.strftime('%Y-%m-%d %H:%M'),
            'dt_to': self.after_tomorrow.strftime('%Y-%m-%d %H:%M'),
        }

        self.assert_res_count(8, q_today)


class RecordsFilterTagsTest(FilterTestCaseMixin, RESTTestCase):
    def setUp(self):
        super().setUp()

        tagA = TagFactory.create(name='TAG--A', owner=self.owner)
        tagB = TagFactory.create(name='TAG--B', owner=self.owner)
        tagC = TagFactory.create(name='TAG--C', owner=self.owner)

        RecordFactory.create_batch(2, tags=[tagA], owner=self.owner)  # A
        RecordFactory.create_batch(2, tags=[tagB], owner=self.owner)  # B
        RecordFactory.create_batch(2, tags=[tagC], owner=self.owner)  # C
        RecordFactory.create_batch(3, tags=[tagA, tagB], owner=self.owner)  # AB
        RecordFactory.create_batch(3, tags=[tagA, tagC], owner=self.owner)  # AC
        RecordFactory.create_batch(3, tags=[tagB, tagC], owner=self.owner)  # BC

        self.tagA, self.tagB, self.tagC = [tagA, tagB, tagC]

    def test_single_tag_or_filter(self):
        q = {
            'tags_or': self.tagA.name
        }
        self.assert_res_count(8, q)

    def test_single_tag_or_filter_for_empty_result(self):
        q = {
            'tags_or': 'abcd-000'
        }
        self.assert_res_count(0, q)

    def test_single_tag_and_filter(self):
        q = {
            'tags_and': self.tagA.name
        }
        self.assert_res_count(8, q)

    def test_single_tag_and_filter_for_empty_result(self):
        q = {
            'tags_and': 'abcd-000'
        }
        self.assert_res_count(0, q)

    def test_many_tags_or_in_filter(self):
        q = {
            'tags_or': [self.tagA.name, self.tagB.name]
        }
        self.assert_res_count(13, q)

    def test_many_tags_and_in_filter(self):
        q = {
            'tags_and': [self.tagA.name, self.tagB.name]
        }
        self.assert_res_count(3, q)


class RecordsFilterAssetsTest(FilterTestCaseMixin, RESTTestCase):
    def setUp(self):
        super().setUp()

        asset_from_A = AssetFactory.create(owner=self.owner)
        asset_from_B = AssetFactory.create(owner=self.owner)
        asset_to_A = AssetFactory.create(owner=self.owner)
        asset_to_B = AssetFactory.create(owner=self.owner)

        RecordFactory.create_batch(5, asset_from=asset_from_A, owner=self.owner)
        RecordFactory.create_batch(3, asset_from=asset_from_B, owner=self.owner)

        RecordFactory.create_batch(7, asset_to=asset_to_A, owner=self.owner)
        RecordFactory.create_batch(4, asset_to=asset_to_B, owner=self.owner)

        RecordFactory.create_batch(1, asset_from=asset_from_A, asset_to=asset_to_A, owner=self.owner)
        RecordFactory.create_batch(2, asset_from=asset_from_B, asset_to=asset_to_B, owner=self.owner)

        self.asset_from_A = asset_from_A
        self.asset_from_B = asset_from_B
        self.asset_to_A = asset_to_A
        self.asset_to_B = asset_to_B

    def test_single_asset_from_filter(self):
        q = {
            'assets_from': self.asset_from_A.pk
        }
        self.assert_res_count(6, q)

    def test_single_asset_from_filter_for_empty_result(self):
        q = {
            'assets_from': self.asset_to_B.pk
        }
        self.assert_res_count(0, q)

    def test_many_assets_from_filter(self):
        q = {
            'assets_from': [self.asset_from_A.pk, self.asset_from_B.pk]
        }
        self.assert_res_count(11, q)

    def test_single_asset_to_filter(self):
        q = {
            'assets_to': self.asset_to_A.pk
        }
        self.assert_res_count(8, q)

    def test_single_asset_to_filter_for_empty_result(self):
        q = {
            'assets_to': self.asset_from_B.pk
        }
        self.assert_res_count(0, q)

    def test_many_assets_to_filter(self):
        q = {
            'assets_to': [self.asset_to_A.pk, self.asset_to_B.pk]
        }
        self.assert_res_count(14, q)

    def test_single_assets_from_to_filter(self):
        q = {
            'assets_from': [self.asset_from_A.pk],
            'assets_to': [self.asset_to_A.pk],
        }
        self.assert_res_count(1, q)

    def test_single_assets_from_to_filter_for_empty_result(self):
        q = {
            'assets_from': [self.asset_from_B.pk],
            'assets_to': [self.asset_to_A.pk],
        }
        self.assert_res_count(0, q)

    def test_multiple_assets_from_to_filter(self):
        q = {
            'assets_from': [self.asset_from_A.pk, self.asset_from_B.pk],
            'assets_to': [self.asset_to_A.pk, self.asset_to_B.pk],
        }
        self.assert_res_count(3, q)
