from itertools import chain
from django.core.checks import (register, Tags, Warning as CheckWarning,
                                Error as CheckError)
from django.conf import settings
from djmoney.settings import CURRENCY_CHOICES

from minicash.utils.checks import requires_settings


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
    name = 'MINICASH_DEFAULT_PAGINATOR_PAGE_SIZE'
    val = getattr(settings, name)

    if not isinstance(val, int):
        yield CheckError(f'{name} value ({val}) must be an integer', id='MINICASH-CHECK-E0020')

    if val < 20 or val > 500:
        yield CheckWarning(
            f'{name} value ({val}) is sub-optimal.',
            'Consider a value in range [20..500].',
            id='MINICASH-CHECK-W0001'
        )


@requires_settings([
    'MINICASH_DEFAULT_CURRENCY',
])
def check_minicash_default_currency():
    CURRENCY_CODES = (c['code'] for c in CURRENCY_CHOICES)

    name = 'MINICASH_DEFAULT_CURRENCY'
    val = getattr(settings, name)

    if val in CURRENCY_CODES:
        yield CheckError(f'{name} value ({val}) is an invalid currency value', id='MINICASH-CHECK-E0030')
