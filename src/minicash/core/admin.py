from django.contrib import admin

# Register your models here.
from .models import Asset, Tag, Record, SubRecord


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = (
        'owner',
        'created_date',
        'delta',
        # 'tags',
        'description',
        'mode',
        'asset_from',
        'asset_to',
        'extra',
    )


admin.site.register(SubRecord)
admin.site.register(Asset)
admin.site.register(Tag)
