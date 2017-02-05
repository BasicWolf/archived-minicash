from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import User
from django.db import models
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

    asset_from = models.ForeignKey('Asset',
                                   null=True, blank=True,
                                   related_name='from_asset_records',
                                   on_delete=models.CASCADE)
    asset_to = models.ForeignKey('Asset',
                                 null=True, blank=True,
                                 related_name='to_asset_records',
                                 on_delete=models.CASCADE)
    created_date = models.DateTimeField('Created')
    delta = models.DecimalField(max_digits=20, decimal_places=3)
    description = models.TextField(blank=True)
    extra = JSONField(default={})
    mode = models.PositiveIntegerField(choices=MODES)
    owner = models.ForeignKey(User, related_name='records')
    tags = models.ManyToManyField('Tag', blank=True)


class SubRecord(models.Model):
    delta = models.DecimalField(max_digits=20, decimal_places=3)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name='sub_records')
    parent_record = models.ForeignKey(
        Record,
        related_name='sub_records',
        null=False,
        blank=False,
    )
    tags = models.ManyToManyField('Tag', blank=True)


class Tag(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField()
    owner = models.ForeignKey(User, related_name='tags')

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name


class Asset(models.Model):
    name = models.CharField(max_length=32)
    description = models.TextField(default='')
    owner = models.ForeignKey(User, related_name='assets')
    saldo = models.IntegerField(default=0)

    class Meta:
        unique_together = (('name', 'owner'))

    def __str__(self):
        return self.name
