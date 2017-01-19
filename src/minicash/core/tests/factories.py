import datetime
import factory.fuzzy as fuzzy
from factory import SubFactory, Faker, SelfAttribute, post_generation
from factory.django import DjangoModelFactory


import minicash.utils.factories as factories
from minicash.auth.tests.factories import UserFactory

from .. import models


class AssetFactory(DjangoModelFactory):
    class Meta:
        model = models.Asset
        django_get_or_create = ('name', )

    name = fuzzy.FuzzyChoice(['Salary', 'Lottery', 'Gift', 'Interest'])
    saldo = fuzzy.FuzzyDecimal(0.00, 10000, 2)
    description = factories.FuzzyText()
    owner = SubFactory(UserFactory)


class TagFactory(DjangoModelFactory):
    class Meta:
        model = models.Tag
        django_get_or_create = ('name', )

    name = Faker('word')
    description = factories.FuzzyText()
    owner = SubFactory(UserFactory)


class TagsMixin:

    @post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted is None:
            tags = factories.FuzzyFactorySequence(TagFactory, owner=self.owner).fuzzer()
        else:
            tags = extracted

        for tag in tags:
            self.tags.add(tag)


class RecordFactory(TagsMixin, DjangoModelFactory):
    class Meta:
        model = models.Record

    created_date = factories.FuzzyDateTime(
        datetime.datetime(1960, 1, 1, tzinfo=datetime.timezone.utc),
        datetime.datetime(2060, 1, 1, tzinfo=datetime.timezone.utc),
    )
    delta = factories.FuzzyDecimal()
    description = Faker('text')
    asset_from = SubFactory(AssetFactory, owner=SelfAttribute('..owner'))
    asset_to = SubFactory(AssetFactory, owner=SelfAttribute('..owner'))
    owner = SubFactory(UserFactory)

    @post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted is None:
            tags = factories.FuzzyFactorySequence(TagFactory, owner=self.owner).fuzzer()
        else:
            tags = extracted

        for tag in tags:
            self.tags.add(tag)


class SubRecordFactory(TagsMixin, DjangoModelFactory):
    class Meta:
        model = models.SubRecord

    parent_record = SubFactory(RecordFactory, owner=SelfAttribute('..owner'))
    owner = SubFactory(UserFactory)

    delta = factories.FuzzyDecimal()
    description = Faker('text')
