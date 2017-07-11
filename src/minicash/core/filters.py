from django_filters import rest_framework as filters

from .models import Record


class RecordFilter(filters.FilterSet):
    dt_from = filters.DateTimeFilter(name='dt_stamp', lookup_expr='gte')
    dt_to = filters.DateTimeFilter(name='dt_stamp', lookup_expr='lte')

    class Meta:
        model = Record
        fields = ['dt_from', 'dt_to']
