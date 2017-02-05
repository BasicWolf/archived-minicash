from collections import OrderedDict
from django.conf import settings
from django.core import urlresolvers

from minicash.core.models import Asset, Record, Tag
from minicash.core.serializers import AssetSerializer, TagSerializer



def build_context(**kwargs):
    assert 'user' in kwargs

    builders = [
        build_settings,
        build_record_modes,
        build_bootstrap,
        build_jsurls,
        build_user,
    ]

    context = {}
    for builder in builders:
        bctx = builder(**kwargs)
        assert set() == set.intersection(set(context.keys()), set(bctx.keys()))
        context.update(bctx)
    return context


def build_settings(**kwargs):
    ctx_settings = {
        'STATIC_URL': settings.STATIC_URL
    }

    return {
        'settings': ctx_settings
    }


def build_record_modes(**kwargs):
    return {
        'RECORD_MODES': OrderedDict([
            ('EXPENSE', {'value': Record.EXPENSE, 'label': Record.MODES[1][1]}),
            ('INCOME', {'value': Record.INCOME, 'label': Record.MODES[0][1]}),
            ('TRANSFER', {'value': Record.TRANSFER, 'label': Record.MODES[2][1]}),
        ])
    }


def build_bootstrap(**kwargs):
    bootstrap = {
        'assets': _build_assets(**kwargs),
        'tags': _build_tags(**kwargs),
    }
    return {'bootstrap': bootstrap}


def _build_assets(**kwargs):
    user = kwargs['user']
    assets = Asset.objects.filter(owner=user)
    return AssetSerializer(assets, many=True).data


def _build_tags(**kwargs):
    user = kwargs['user']
    tags = Tag.objects.filter(owner=user)
    return TagSerializer(tags, many=True).data


def build_jsurls(**kwargs):
    url_patterns = urlresolvers.get_resolver().reverse_dict.items()
    urls = {}

    for name_or_callable, pattern in url_patterns:
        # for now, ignore callables (they should be unwrapped in views)
        if callable(name_or_callable):
            continue

        url_pattern, pattern_args = pattern[0][0]
        urls[name_or_callable] = {'url': url_pattern, 'args': pattern_args}
    return {'urls': urls}


def build_user(**kwargs):
    user = kwargs['user']
    user_context = {
        'dtFormat': user.profile.get_dt_format_display()
    }

    return {'user': user_context}
