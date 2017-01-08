from collections import OrderedDict
from django.core import urlresolvers

from minicash.core.models import Record, Asset
from minicash.core.serializers import AssetSerializer



def build_context(**kwargs):
    assert 'user' in kwargs

    builders = [
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


def build_record_modes(**kwargs):
    return {
        'RECORD_MODES': OrderedDict([
            ('INCOME', Record.INCOME),
            ('EXPENSE', Record.EXPENSE),
            ('TRANSFER', Record.TRANSFER),
        ])
    }


def build_bootstrap(**kwargs):
    bootstrap = {
        'assets': _build_assets(**kwargs)
    }
    return {'bootstrap': bootstrap}


def _build_assets(**kwargs):
    user = kwargs['user']
    assets = Asset.objects.filter(owner=user)
    return AssetSerializer(assets, many=True).data


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
