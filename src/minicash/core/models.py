from django.contrib.auth.models import User
from django.db import models
from jsonfield import JSONField


class Record(models.Model):
    INCOME = 10
    EXPENSE = 20
    TRANSFER = 30

    MODES = (
        (INCOME, 'Income'),
        (EXPENSE, 'Expense'),
        (TRANSFER, 'Transfer'),
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
    owner = models.ForeignKey(User, related_name='records')
    tags = models.ManyToManyField('Tag', blank=True)

    modes_mapping = {
        (True, True): TRANSFER,
        (True, False): INCOME,
        (False, True): EXPENSE
    }

    @property
    def mode(self):
        try:
            _to, _from = bool(self.asset_to), bool(self.asset_from)
            return self.modes_mapping[(_to, _from)]
        except KeyError:
            raise ValueError("Invalid asset attributes' values")


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
