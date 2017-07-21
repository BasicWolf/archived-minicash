from functools import wraps

from django.conf import settings
from django.core.checks import Error

from minicash.core.settings import minicash_settings

class NotDefined:
    pass


def is_defined(name):
    return getattr(minicash_settings, name, NotDefined) != NotDefined


class requires_minicash_settings:
    '''A decorator which checks for required Minicash settings
       and yields Error CheckMessages if settings are not found.'''

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
                if len(self.settings_list) == 1:
                    name = self.settings_list[0]
                    val = getattr(minicash_settings, name)
                    yield from f(name=name, val=val, *args, **kwargs)
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
