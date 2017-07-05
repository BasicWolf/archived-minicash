from moneyed import Money

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

    def update_assets_after_create(self):
        self._update_assets_on_change(old_delta=0)

    def update_assets_after_update(self, old_delta):
        self._update_assets_on_change(old_delta=old_delta)

    def update_assets_before_destroy(self):
        self._update_assets_on_change(delete=True)

    def _update_assets_on_change(self, old_delta=0, delete=False):
        if delete:
            assert old_delta == 0, 'old_delta should be 0 when delete is True'
        if self.mode == Record.TRANSFER:
            assert self.asset_to.balance.currency == self.asset_from.balance.currency, 'Different currencies'

        sign = delete and -1 or 1
        delta = sign * self.delta

        if self.mode in (Record.EXPENSE, Record.TRANSFER):
            asf = self.asset_from
            delta_money = Money(amount=delta, currency=asf.balance.currency)
            old_delta_money = Money(amount=old_delta, currency=asf.balance.currency)
            asf.balance += old_delta_money
            asf.balance -= delta_money
            asf.save()

        if self.mode in (Record.INCOME, Record.TRANSFER):
            ast = self.asset_to
            delta_money = Money(amount=delta, currency=ast.balance.currency)
            old_delta_money = Money(amount=old_delta, currency=ast.balance.currency)
            ast.balance -= old_delta_money
            ast.balance += delta_money
            ast.save()


class Tag(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, related_name='tags')

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name


class AssetManager(models.Manager):
    def create(self, **kwargs):
        # ensure Asset.initial_balance == balance on creation
        if 'initial_balance' not in kwargs:
            try:
                kwargs['initial_balance'] = kwargs['balance']
            except KeyError:
                pass
        return super().create(**kwargs)


class Asset(models.Model):
    objects = AssetManager()

    name = models.CharField(max_length=32)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, related_name='assets')
    balance = MoneyField(max_digits=10, decimal_places=2, default_currency=settings.MINICASH_DEFAULT_CURRENCY)
    initial_balance = MoneyField(max_digits=10, decimal_places=2, default_currency=settings.MINICASH_DEFAULT_CURRENCY)

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name
