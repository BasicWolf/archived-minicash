from collections import Iterable

from rest_framework import serializers
from rest_framework.renderers import JSONRenderer
from rest_framework import serializers

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


class UserRelatedFieldBase:
    def __init__(self, *args, user_field_name, **kwargs):
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


class UserPrimaryKeyRelatedField(UserRelatedFieldBase,
                                 serializers.PrimaryKeyRelatedField):
    def __init__(self, *args, user_field_name, **kwargs):
        UserRelatedFieldBase.__init__(self, user_field_name=user_field_name,
                                       *args, **kwargs)
        serializers.PrimaryKeyRelatedField.__init__(self, *args, **kwargs)


class UserSlugRelatedField(UserRelatedFieldBase, serializers.SlugRelatedField):
    def __init__(self, *args, user_field_name, **kwargs):
        UserRelatedFieldBase.__init__(self, user_field_name=user_field_name,
                                       *args, **kwargs)
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
