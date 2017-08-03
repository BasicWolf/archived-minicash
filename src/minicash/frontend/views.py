import json
import logging

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from minicash.utils.json import JSONEncoder
from .context import build_context


logger = logging.getLogger(__name__)


@login_required
def index(request, route):
    minicash_context = build_context(user=request.user, route=route)

    minicash_json_context = json.dumps(minicash_context, cls=JSONEncoder)
    logger.debug('JSON context: %s', minicash_json_context)

    context = {'minicash_context': minicash_json_context}
    return render(request, 'frontend/index.djhtml', context)
