from django_filters import rest_framework as filters

from .models import Record


class RecordFilter(filters.FilterSet):
    recorded_at = filters.DateTimeFromToRangeFilter(name='dt_stamp')

    class Meta:
        model = Record
        fields = ['recorded_at']
