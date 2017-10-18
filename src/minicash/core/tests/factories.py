import datetime
import factory.fuzzy as fuzzy
from factory import (SubFactory, Faker, SelfAttribute, post_generation,
                     lazy_attribute, Sequence)
from factory.django import DjangoModelFactory


import minicash.utils.factories as factories
from minicash.auth.tests.factories import UserFactory

from .. import models


class AssetFactory(DjangoModelFactory):
    class Meta:
        model = models.Asset
        django_get_or_create = ('name', )

    name = Sequence(lambda n: f'asset-{n}')
    balance = fuzzy.FuzzyDecimal(0.00, 10000, 2)
    description = factories.FuzzyText()
    owner = SubFactory(UserFactory)


class TagFactory(DjangoModelFactory):
    class Meta:
        model = models.Tag
        django_get_or_create = ('name', )

    name = Faker('word')
    description = factories.FuzzyText()
    owner = SubFactory(UserFactory)


class RecordFactory(DjangoModelFactory):
    class Meta:
        model = models.Record

    @post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted is None:
            tags = factories.FuzzyFactorySequence(
                TagFactory,
                f_kwargs={'owner': self.owner}
            ).fuzz()
        else:
            tags = extracted

        for tag in tags:
            self.tags.add(tag)  # pylint: disable=no-member

    created_dt = factories.FuzzyDateTime(
        datetime.datetime(2016, 1, 1, tzinfo=datetime.timezone.utc),
        datetime.datetime(2018, 1, 1, tzinfo=datetime.timezone.utc),
    )
    delta = fuzzy.FuzzyDecimal(0.01, 10000, 2)
    description = Faker('text')
    asset_from = SubFactory(AssetFactory, owner=SelfAttribute('..owner'))
    asset_to = SubFactory(AssetFactory, owner=SelfAttribute('..owner'))
    owner = SubFactory(UserFactory)

    @lazy_attribute
    def mode(self):
        if self.asset_from and self.asset_to:
            return models.Record.TRANSFER
        elif self.asset_from:
            return models.Record.EXPENSE
        elif self.asset_to:
            return models.Record.INCOME
        else:
            return None
