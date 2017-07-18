from django.db import migrations, models


def count_tags(apps, schema_editor):
    Tag = apps.get_model('minicash_core', 'Tag')

    for tag in Tag.objects.all():
        tag.records_count = tag.record_set.count()
        tag.save()


class Migration(migrations.Migration):

    dependencies = [
        ('minicash_core', '0014_index_tag_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='tag',
            name='records_count',
            field=models.PositiveIntegerField(default=0),
        ),
         migrations.RunPython(count_tags),
    ]
