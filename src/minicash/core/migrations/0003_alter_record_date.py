# -*- coding: utf-8 -*-
#    Copyright (C) 2017 Zaur Nasibov and contributors
#
#    This file is part of Minicash.

#    Minicash is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    Foobar is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

#    You should have received a copy of the GNU General Public License

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
