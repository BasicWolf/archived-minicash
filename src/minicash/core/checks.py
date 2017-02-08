from itertools import chain
from django.core.checks import register, Tags, Warning, Error
from django.conf import settings

from minicash.utils.checks import requires_settings, is_defined


@register(Tags.compatibility)
def check_settings(app_configs, **kwargs):
    """Check Minicash setting"""
    return list(chain(
        check_paginator_settings(),
    ))


@requires_settings([
    'MINICASH_DEFAULT_PAGINATOR_PAGE_SIZE',
])
def check_paginator_settings():
    sname = 'MINICASH_DEFAULT_PAGINATOR_PAGE_SIZE'
    sval = getattr(settings, sname)

    if not isinstance(sval, int):
        yield Error(f'{sname} value ({sval}) must be an integer', id='MINICASH-CHECK-E0002')

    if sval < 20 or sval > 500:
        yield Warning(
            f'{sname} value ({sval}) is sub-optimal.',
            'Consider a value in range [20..500].',
            id='MINICASH-CHECK-W0001'
        )
