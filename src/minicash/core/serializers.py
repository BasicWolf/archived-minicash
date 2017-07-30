from django.utils.translation import ugettext as _

from rest_framework import serializers

from minicash.utils.serializers import (
    ModelSerializer,
    UserPrimaryKeyRelatedField,
    CreatableUserSlugRelatedField,
)
from minicash.auth.serializers import UserDateTimeField
from .models import Record, Tag, Asset


class ReadRecordSerializer(ModelSerializer):
    class Meta:
        model = Record
        fields = [
            'pk', 'owner',
            'asset_from', 'asset_to', 'created_dt', 'delta',
            'description', 'extra', 'mode', 'tags',
        ]

    VALID_MODES_MAPPING = {
        (True, True): Record.TRANSFER,
        (True, False): Record.INCOME,
        (False, True): Record.EXPENSE
    }

    owner = serializers.HiddenField(
        default=serializers.CurrentUserDefault(),
    )

    asset_to = UserPrimaryKeyRelatedField(
        user_field_name='owner',
        queryset=Asset.objects,
        allow_null=True,
    )

    asset_from = UserPrimaryKeyRelatedField(
        user_field_name='owner',
        queryset=Asset.objects,
        allow_null=True,
    )

    created_dt = UserDateTimeField(
        user_field_name='owner',
        read_only=False,
    )

    tags = UserPrimaryKeyRelatedField(
        user_field_name='owner',
        queryset=Tag.objects,
        many=True,
        allow_null=True,
    )

    def validate(self, attrs):
        return self._validate_assets(attrs)

    def _validate_assets(self, attrs):
        to_from_mode = (bool(attrs['asset_to']), bool(attrs['asset_from']))

        try:
            if attrs['mode'] != self.VALID_MODES_MAPPING[to_from_mode]:
                raise serializers.ValidationError(_('VERIFY-0002: Invalid mode or assets data'))
        except KeyError as e:
            raise serializers.ValidationError(_('VERIFY-0001: Either of the assets and mode must be defined in a record')) from e

        return attrs


class CreateRecordSerializer(ReadRecordSerializer):
    class Meta(ReadRecordSerializer.Meta):
        fields = ReadRecordSerializer.Meta.fields + ['tags_names']

    tags_names = CreatableUserSlugRelatedField(
        source='tags',
        user_field_name='owner',
        slug_field='name',
        queryset=Tag.objects,
        many=True,
        allow_null=True,
    )


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ['pk', 'owner',
                  'description', 'name', 'records_count']

    owner = serializers.HiddenField(
        default=serializers.CurrentUserDefault(),
    )

    records_count = serializers.SerializerMethodField()

    def get_records_count(self, obj):
        # tag.records cannot be resolved unless tag has a primary key
        if not obj.pk:
            return 0
        return obj.records.count()

    def validate(self, attrs):
        return self._validate_name(attrs)

    def _validate_name(self, attrs):
        name = attrs['name']

        # check that name contains no commas
        if ',' in name:
            raise serializers.ValidationError(_('VERIFY-0003: Invalid tag name: {}'.format(name)))

        return attrs


class AssetSerializer(ModelSerializer):
    class Meta:
        model = Asset
        fields = ['pk', 'owner',
                  'balance', 'description', 'name']

    owner = serializers.HiddenField(
        default=serializers.CurrentUserDefault(),
    )


class UpdateAssetSerializer(AssetSerializer):
    class Meta:
        model = Asset
        fields = ['pk', 'owner',
                  'description', 'name']


class CreateAssetSerializer(AssetSerializer):
    class Meta:
        model = Asset
        fields = ['pk', 'owner',
                  'balance', 'description', 'name']
