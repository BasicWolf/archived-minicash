import json

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from .context import build_context

import logging


logger = logging.getLogger(__name__)


@login_required
def index(request):
    minicash_context = build_context(user=request.user)

    minicash_json_context = json.dumps(minicash_context)
    logger.debug('JSON context: %s', minicash_json_context)

    context = {'minicash_context': minicash_json_context}
    return render(request, 'frontend/index.html', context)

