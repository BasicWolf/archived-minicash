from django_filters import rest_framework as filters

from .models import Asset, Record, Tag


def user_tags(request):
    return Tag.objects.for_owner(request.user)


def user_assets(request):
    return Asset.objects.for_owner(request.user)

class RecordFilter(filters.FilterSet):
    class Meta:
        model = Record
        fields = [
            'pk',
            'assets_from',
            'assets_to',
            'dt_from',
            'dt_to',
            'tags_and',
            'tags_or',
            'mode',
        ]

    pk = filters.AllValuesMultipleFilter(
        name='pk',
        conjoined=False,
    )

    dt_from = filters.DateTimeFilter(name='created_dt', lookup_expr='gte')

    dt_to = filters.DateTimeFilter(name='created_dt', lookup_expr='lte')

    tags_or = filters.ModelMultipleChoiceFilter(
        name='tags__pk',
        to_field_name='pk',
        queryset=user_tags,
        conjoined=False,
    )
    tags_and = filters.ModelMultipleChoiceFilter(
        name='tags__pk',
        to_field_name='pk',
        queryset=user_tags,
        conjoined=True,
    )

    assets_from = filters.ModelMultipleChoiceFilter(
        name='asset_from',
        queryset=user_assets,
        conjoined=False,
    )

    assets_to = filters.ModelMultipleChoiceFilter(
        name='asset_to',
        queryset=user_assets,
        conjoined=False,
    )

    mode_or = filters.MultipleChoiceFilter(
        name='mode',
        choices=Record.MODES,
        conjoined=False,
    )

    sort_by = filters.OrderingFilter(
        # tuple-mapping retains order
        fields=(
            ('created_dt', 'created_ts'),
        ),
    )
