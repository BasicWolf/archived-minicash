from django.conf import settings
from django.dispatch import receiver
from django.test.signals import setting_changed


VALID_SETTINGS_LIST = [
    'AUTH_DEFAULT_BACKEND_DATETIME_FORMAT',
    'DEFAULT_CURRENCY',
    'PAGINATOR_DEFAULT_PAGE_SIZE',
    'PAGINATOR_MAX_PAGE_SIZE',
]


class MinicashSettings(object):
    """
    A settings object, that allows Minicash settings to be accessed as properties.
    For example:
        from minicash.core.settings import minicash_settings
        print(minicash_settings.DEFAULT_PAGINATOR_SIZE)
    """
    def __init__(self, user_settings=None, valid_settings_list=None):
        if user_settings:
            self._user_settings = user_settings

        self.valid_settings_list = valid_settings_list or VALID_SETTINGS_LIST

    @property
    def user_settings(self):
        if not hasattr(self, '_user_settings'):
            self._user_settings = getattr(settings, 'MINICASH', {})
        return self._user_settings

    def __getattr__(self, attr):
        if attr not in self.valid_settings_list:
            raise AttributeError(f"Invalid Minicash setting: {attr}")

        val = self.user_settings[attr]

        # Cache the result
        setattr(self, attr, val)
        return val


minicash_settings = MinicashSettings(None)


@receiver(setting_changed)
def reload_minicash_settings(*args, setting=None, value=None, **kwargs, ):
    global minicash_settings
    if setting == 'MINICASH':
        minicash_settings = MinicashSettings(value)
