from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('minicash_core', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='asset',
            unique_together=set([('name', 'owner')]),
        ),
        migrations.AlterUniqueTogether(
            name='tag',
            unique_together=set([('name', 'owner')]),
        ),
    ]
