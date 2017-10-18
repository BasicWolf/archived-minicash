from collections import Iterable

from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import smart_text
from rest_framework import serializers
from rest_framework.renderers import JSONRenderer

from .errors import UserNotLoggedInError


class JSONSerializerMixin:
    @classmethod
    def to_json(cls, obj):
        if isinstance(obj, Iterable):
            serializer = cls(obj, many=True)
        else:
            serializer = cls(obj)
        return JSONRenderer().render(serializer.data)

    def json(self):
        return JSONRenderer().render(self.data)


class ModelSerializer(JSONSerializerMixin, serializers.ModelSerializer):
    pass


class UserRelatedFieldMixin:
    def __init__(self, user_field_name):
        self._user_field_name = user_field_name

    def get_queryset(self):
        queryset = super().get_queryset()
        q = {self._user_field_name: self.get_user()}
        return queryset.filter(**q)

    def get_user(self, *, throw_exc=False):
        request = self.context.get('request', None)
        if request is None:
            if throw_exc:
                raise UserNotLoggedInError()
            else:
                return None
        return request.user


class UserPrimaryKeyRelatedField(UserRelatedFieldMixin,
                                 serializers.PrimaryKeyRelatedField):
    def __init__(self, *args, user_field_name, **kwargs):
        UserRelatedFieldMixin.__init__(self, user_field_name)
        serializers.PrimaryKeyRelatedField.__init__(self, *args, **kwargs)


class UserSlugRelatedField(UserRelatedFieldMixin, serializers.SlugRelatedField):
    def __init__(self, *args, user_field_name, **kwargs):
        UserRelatedFieldMixin.__init__(self, user_field_name)
        serializers.SlugRelatedField.__init__(self, *args, **kwargs)


class CreatableUserSlugRelatedField(UserSlugRelatedField):

    def to_internal_value(self, data):
        try:
            obj, _ = self.get_queryset().get_or_create(
                defaults={self._user_field_name: self.get_user()},
                **{self.slug_field: data}
            )
            return obj
        except ObjectDoesNotExist:
            self.fail('does_not_exist', slug_name=self.slug_field, value=smart_text(data))
        except (TypeError, ValueError):
            self.fail('invalid')
