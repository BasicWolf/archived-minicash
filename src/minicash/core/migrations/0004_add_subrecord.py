# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('minicash_core', '0003_alter_record_date'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubRecord',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField(blank=True)),
                ('delta', models.DecimalField(decimal_places=3, max_digits=20)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sub_records_set', to=settings.AUTH_USER_MODEL)),
                ('parent_record', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sub_records_set', to='minicash_core.Record')),
                ('tags', models.ManyToManyField(blank=True, to='minicash_core.Tag')),
            ],
        ),
    ]
