import re

from collections import OrderedDict
from django.conf import settings
from django.core import urlresolvers

from minicash.core.models import Asset, Record, Tag
from minicash.core.serializers import AssetSerializer, TagSerializer
from minicash.core.settings import minicash_settings


def build_context(**kwargs):
    assert 'user' in kwargs
    assert 'route' in kwargs

    builders = [
        build_settings,
        build_record_modes,
        build_bootstrap,
        build_routes_maps,
        build_user,
        build_route,
    ]

    context = {}
    for builder in builders:
        bctx = builder(**kwargs)
        assert set() == set.intersection(set(context.keys()), set(bctx.keys()))
        context.update(bctx)
    return context


def build_settings(**kwargs):
    ctx_settings = {
        'DATETIME_FORMAT': 'YYYY-MM-DD hh:mm',
        'STATIC_URL': settings.STATIC_URL,
        'PAGINATOR_DEFAULT_PAGE_SIZE': minicash_settings.PAGINATOR_DEFAULT_PAGE_SIZE,
        'PAGINATOR_MAX_PAGE_SIZE': minicash_settings.PAGINATOR_MAX_PAGE_SIZE,
    }

    return {
        'settings': ctx_settings,
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


def _build_assets(user, **kwargs):
    assets = Asset.objects.for_owner(user)
    return AssetSerializer(assets, many=True).data


def _build_tags(user, **kwargs):
    tags = Tag.objects.for_owner(user)
    return TagSerializer(tags, many=True).data


def build_routes_maps(**kwargs):
    url_patterns = urlresolvers.get_resolver().reverse_dict.items()
    urls = {}
    bb_route_re = re.compile(r'\%\((\w+)\)s')

    def bb_route_repl(mo):
        return ':' + mo.group(1)

    for name_or_callable, pattern in url_patterns:
        # for now, ignore callables (they should be unwrapped in views)
        if callable(name_or_callable):
            continue

        urls[name_or_callable] = [{
            # srintf-formattable url
            'sprintf_url': '/' + url_pattern,
            # Backbone/Marionette-friendly route e.g. /tabs/records/:id
            'bb_route': re.sub(bb_route_re, bb_route_repl, url_pattern),
            'args': pattern_args
        } for url_pattern, pattern_args in pattern[0]]
    return {'urls': urls}


def build_user(user, **kwargs):
    user_context = {
        'dtFormat': user.profile.get_dt_format_display(),
        'dateFormat': user.profile.date_format_frontend,
        'timeFormat': user.profile.time_format_frontend,
    }

    return {'user': user_context}


def build_route(*, route='', **kwargs):
    return {'route': route}
