from django_filters import rest_framework as filters

from .models import Record, Tag


def user_tags(request):
    return Tag.objects.for_owner(request.user)


class RecordFilter(filters.FilterSet):
    dt_from = filters.DateTimeFilter(name='created_dt', lookup_expr='gte')
    dt_to = filters.DateTimeFilter(name='created_dt', lookup_expr='lte')
    tags = filters.ModelMultipleChoiceFilter(
        name='tags__name',
        to_field_name='name',
        queryset=user_tags
    )

    class Meta:
        model = Record
        fields = ['dt_from', 'dt_to', 'tags']
