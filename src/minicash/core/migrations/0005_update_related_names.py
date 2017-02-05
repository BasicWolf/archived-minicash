from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0004_add_subrecord'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asset',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assets', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='record',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='records', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='subrecord',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sub_records', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='subrecord',
            name='parent_record',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sub_records', to='minicash_core.Record'),
        ),
        migrations.AlterField(
            model_name='tag',
            name='owner',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tags', to=settings.AUTH_USER_MODEL),
        ),
    ]
