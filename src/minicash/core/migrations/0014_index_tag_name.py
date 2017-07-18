from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0013_dt_stamp_to_created_dt'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='name',
            field=models.CharField(db_index=True, max_length=32),
        ),
    ]
