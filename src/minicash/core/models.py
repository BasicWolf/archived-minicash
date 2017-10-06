from decimal import Decimal
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.db import models
from djmoney.models.fields import MoneyField
from jsonfield import JSONField

from minicash.core.settings import minicash_settings
from minicash.utils.models import MinicashModelManager

MAX_DIGITS = 13
DECIMAL_PLACES = 3


class Record(models.Model):
    objects = MinicashModelManager()

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
    created_dt = models.DateTimeField('Created', db_index=True)
    delta = MoneyField(
        max_digits=MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
        default_currency=minicash_settings.DEFAULT_CURRENCY,
    )
    description = models.TextField(blank=True)
    extra = JSONField(default={})
    mode = models.PositiveIntegerField(choices=MODES)
    owner = models.ForeignKey(User, related_name='records')
    tags = models.ManyToManyField('Tag', blank=True, related_name='records')

    def update_assets_after_create(self):
        self._update_assets_on_change(old_delta=0)

    def update_assets_after_update(self, old_delta, old_asset_to, old_asset_from):
        self._update_assets_on_change(old_delta=old_delta,
                                      old_asset_to=old_asset_to,
                                      old_asset_from=old_asset_from)

    def update_assets_before_destroy(self):
        self._update_assets_on_change(delete=True)

    def _update_assets_on_change(self, *, delete=False, old_delta=0,
                                 old_asset_to=None, old_asset_from=None):
        if delete:
            assert old_delta == 0, 'old_delta should be 0 when delete is True'
        if self.mode == Record.TRANSFER:
            assert self.asset_to.balance.currency == self.asset_from.balance.currency, 'Different currencies'

        asset_from = self.asset_from
        asset_to = self.asset_to
        old_asset_from = old_asset_from or self.asset_from
        old_asset_to = old_asset_to or self.asset_to

        delta_changed = self.delta != old_delta
        asset_to_changed = asset_to != old_asset_to
        asset_from_changed = asset_from != old_asset_from
        any_changes = delta_changed or asset_to_changed or asset_from_changed

        # RETURN if no changes detected
        if not delete and not any_changes:
            return

        sign = delete and -1 or 1
        delta = sign * self.delta

        if self.mode in (Record.EXPENSE, Record.TRANSFER):
            assert delta.currency == old_asset_from.balance.currency == asset_from.balance.currency
            # check, whether asset_from has been changed and act accordingly
            if asset_from_changed:
                old_asset_from.balance += old_delta
                asset_from.balance -= delta
                old_asset_from.save()
                asset_from.save()
            else:
                asset_from.balance += old_delta
                asset_from.balance -= delta
                asset_from.save()

        if self.mode in (Record.INCOME, Record.TRANSFER):
            assert delta.currency == old_asset_to.balance.currency == asset_to.balance.currency
            # check, whether asset_to has been changed and act accordingly
            if asset_to_changed:
                old_asset_to.balance -= old_delta
                asset_to.balance += delta
                old_asset_to.save()
                asset_to.save()
            else:
                asset_to.balance -= old_delta
                asset_to.balance += delta
                asset_to.save()


class Tag(models.Model):
    objects = MinicashModelManager()

    name = models.CharField(max_length=32, db_index=True)
    description = models.TextField(blank=True, default='')
    owner = models.ForeignKey(User, related_name='tags')

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name


class AssetManager(MinicashModelManager):
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
    balance = MoneyField(
        max_digits=MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
        default=Decimal('0.0'),
        default_currency=minicash_settings.DEFAULT_CURRENCY
    )
    initial_balance = MoneyField(
        max_digits=MAX_DIGITS,
        decimal_places=DECIMAL_PLACES,
        default=Decimal('0.0'),
        default_currency=minicash_settings.DEFAULT_CURRENCY,
    )

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name
