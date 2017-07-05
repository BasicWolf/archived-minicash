from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0007_auto_20170506_1848'),
    ]

    operations = [
        migrations.RenameField(
            model_name='record',
            old_name='created_date',
            new_name='dt_stamp',
        ),
    ]
