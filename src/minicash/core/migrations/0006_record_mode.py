from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0005_update_related_names'),
    ]

    operations = [
        migrations.AddField(
            model_name='record',
            name='mode',
            field=models.PositiveIntegerField(choices=[(10, 'Income'), (20, 'Expense'), (30, 'Transfer')], default=10),
            preserve_default=False,
        ),
    ]
