from collections import namedtuple
from django.db import models
from django.contrib.auth.models import User


DateTimeFormat = namedtuple('DateTimeFormat', ['frontend_format', 'backend_format'])

# NOTE, it is expected that DATE comes first
# and DATE TIME are split by space,
DT_FORMATS = [
    # ('frontend format', 'backend format')
    DateTimeFormat('DD/MM/YYYY HH:mm', '%d/%m/%Y %H:%M'),
]


class UserProfile(models.Model):
    DT_FORMAT_CHOICES = tuple(
        (i, dtf.frontend_format)
        for i, dtf in enumerate(DT_FORMATS)
    )

    user = models.OneToOneField(
        User,
        primary_key=True,
        on_delete=models.CASCADE,
        related_name='profile',
    )

    dt_format = models.IntegerField(
        choices=DT_FORMAT_CHOICES,
        default=0,
        verbose_name='Date / time format',
    )

    @property
    def date_format(self):
        backend_format = DT_FORMATS[self.dt_format].backend_format
        return backend_format.split(' ')[0]

    @property
    def time_format(self):
        backend_format = DT_FORMATS[self.dt_format].backend_format
        return backend_format.split(' ')[1]

    @property
    def date_format_frontend(self):
        frontend_format = self.get_dt_format_display()
        return frontend_format.split(' ')[0]

    @property
    def time_format_frontend(self):
        frontend_format = self.get_dt_format_display()
        return frontend_format.split(' ')[1]
