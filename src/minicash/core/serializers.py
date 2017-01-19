from django.contrib.auth.models import User

from rest_framework import serializers

from minicash.utils.serializers import (
    ModelSerializer,
    UserPrimaryKeyRelatedField,
    CreatableUserSlugRelatedField,
)
from minicash.auth.serializers import UserDateTimeField
from .models import Record, Tag, Asset, SubRecord


class SubRecordSerializer(ModelSerializer):
    class Meta:
        model = SubRecord
        fields = ['pk', 'owner', 'parent_record',
                  'delta', 'description', 'tags']

    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects,
        write_only=True,
        default=serializers.CurrentUserDefault(),
    )

    parent_record = UserPrimaryKeyRelatedField(
        user_field_name='owner',
        queryset=Record.objects,
        read_only=False,
    )

    tags = CreatableUserSlugRelatedField(
        user_field_name='owner',
        slug_field='name',
        queryset=Tag.objects,
        many=True,
        allow_null=True,
    )


class RecordSerializer(ModelSerializer):
    class Meta:
        model = Record
        fields = [
            'pk', 'owner',
            'asset_from', 'asset_to', 'created_date', 'delta',
            'description', 'extra', 'mode', 'sub_records', 'tags',
        ]

    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects,
        write_only=True,
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

    created_date = UserDateTimeField(
        user_field_name='owner',
        read_only=False,
    )

    sub_records = SubRecordSerializer(
        many=True,
        read_only=True,
    )

    tags = CreatableUserSlugRelatedField(
        user_field_name='owner',
        slug_field='name',
        queryset=Tag.objects,
        many=True,
        allow_null=True,
    )

    def validate(self, data):
        # Validate assets
        _to, _from = bool(data['asset_to']), bool(data['asset_from'])

        if (_to, _from) not in Record.modes_mapping:
            raise serializers.ValidationError('Either of the assets must be '
                                              'defined in a record')
        return data


class TagSerializer(ModelSerializer):
    class Meta:
        model = Tag
        fields = ['pk', 'description', 'name', 'owner']

    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects,
        write_only=True,
        default=serializers.CurrentUserDefault(),
    )


class AssetSerializer(ModelSerializer):
    class Meta:
        model = Asset
        fields = ['pk', 'description', 'name', 'owner', 'saldo']

    owner = serializers.PrimaryKeyRelatedField(
        queryset=User.objects,
        write_only=True,
        default=serializers.CurrentUserDefault(),
    )
