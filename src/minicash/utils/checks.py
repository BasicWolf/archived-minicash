from functools import wraps

from django.conf import settings
from django.core.checks import Error


class NotDefined:
    pass


def is_defined(name):
    return getattr(settings, name, NotDefined) != NotDefined


class requires_settings:
    '''A decorator which checks for required settings and yields Error CheckMessages if settings are not found.'''
    def __init__(self, settings_list=[]):
        self.settings_list = settings_list

    def __call__(self, f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            messages = list(self._check_settings_defined())
            if messages:
                yield from messages
                raise StopIteration()
            else:
                yield from f(*args, **kwargs)
        return wrapper

    def _check_settings_defined(self):
        for setting_name in self.settings_list:
            if not is_defined(setting_name):
                yield Error(
                    f"Setting {setting_name} is not found in settings.",
                    id='MINICASH-CHECK-E0001'
                )
