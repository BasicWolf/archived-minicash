# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0002_add_unique_constraints'),
    ]

    operations = [
        migrations.RenameField(
            model_name='record',
            old_name='date',
            new_name='created_date',
        ),

        migrations.AlterField(
            model_name='record',
            name='created_date',
            field=models.DateTimeField(verbose_name='Created'),
        ),
    ]
