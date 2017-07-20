from django.contrib import admin

# Register your models here.
from .models import Asset, Tag, Record


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = (
        'owner',
        'created_dt',
        'delta',
        # 'tags',
        'description',
        'mode',
        'asset_from',
        'asset_to',
        'extra',
    )


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'description',
    )


admin.site.register(Asset)

