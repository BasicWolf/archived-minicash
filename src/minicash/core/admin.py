from django.contrib import admin

# Register your models here.
from .models import Asset, Tag, Record


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = (
        'owner',
        'dt_stamp',
        'delta',
        # 'tags',
        'description',
        'mode',
        'asset_from',
        'asset_to',
        'extra',
    )


admin.site.register(Asset)
admin.site.register(Tag)
