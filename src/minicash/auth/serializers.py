from rest_framework import serializers
from rest_framework.settings import api_settings

from minicash.core.settings import minicash_settings
from minicash.utils.serializers import UserRelatedFieldBase
from .models import DT_FORMATS


class UserDateTimeField(serializers.DateTimeField, UserRelatedFieldBase):
    # pylint: disable=redefined-builtin
    def __init__(self, *args, user_field_name, format=None, input_formats=None, **kwargs):
        assert format is None, '`format` should now be supplied explicitly in {}'.format(self.__class__.__name__)
        assert input_formats is None, '`input_formats` should now be supplied explicitly in {}'.format(self.__class__.__name__)

        self.__format = None
        self.__input_formats = api_settings.DATETIME_INPUT_FORMATS

        UserRelatedFieldBase.__init__(self, user_field_name=user_field_name,
                                      *args, **kwargs)
        serializers.DateTimeField.__init__(self, *args, **kwargs)

    @property
    def format(self):
        if self.__format is None:
            self.__format = self.__get_format()
        return self.__format

    def __get_format(self):
        user = self.get_user()
        if user is not None:
            backend_format = DT_FORMATS[user.profile.dt_format].backend_format
        else:
            backend_format = minicash_settings.AUTH_DEFAULT_BACKEND_DATETIME_FORMAT

        return backend_format

    @property
    def input_formats(self):
        if self.format not in self.__input_formats:
            self.__input_formats = (self.format, ) + self.__input_formats
        return self.__input_formats
