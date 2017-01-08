from django.db import models
from django.contrib.auth.models import User

# Create your models here.



DT_FORMATS = [
    # ('frontend format', 'backend format')
    ('DD/MM/YYYY HH:mm', '%d/%m/%Y %H:%M'),
]

class UserProfile(models.Model):
    DT_FORMAT_CHOICES = tuple(
        (i, dtf[0])
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
