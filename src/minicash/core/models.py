import moneyed
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.db import models
from djmoney.models.fields import MoneyField
from jsonfield import JSONField






class Record(models.Model):
    INCOME = 10
    EXPENSE = 20
    TRANSFER = 30

    MODES = (
        (INCOME, _('Income')),
        (EXPENSE, _('Expense')),
        (TRANSFER, _('Transfer')),
    )

    asset_from = models.ForeignKey(
        'Asset',
        blank=True,
        db_index=True,
        null=True,
        on_delete=models.PROTECT,
        related_name='from_asset_records',
    )

    asset_to = models.ForeignKey(
        'Asset',
        blank=True,
        db_index=True,
        null=True,
        on_delete=models.PROTECT,
        related_name='to_asset_records',
    )

    dt_stamp = models.DateTimeField('Created', db_index=True)
    delta = models.DecimalField(max_digits=20, decimal_places=3)
    description = models.TextField(blank=True)
    extra = JSONField(default={})
    mode = models.PositiveIntegerField(choices=MODES)
    owner = models.ForeignKey(User, related_name='records')
    tags = models.ManyToManyField('Tag', blank=True)


class Tag(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, related_name='tags')

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name


class Asset(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, related_name='assets')
    saldo = MoneyField(max_digits=10, decimal_places=2, default_currency=settings.MINICASH_DEFAULT_CURRENCY)

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name
