from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0012_record_delta_as_currency'),
    ]

    operations = [
        migrations.RenameField(
            model_name='record',
            old_name='dt_stamp',
            new_name='created_dt',
        ),
    ]
