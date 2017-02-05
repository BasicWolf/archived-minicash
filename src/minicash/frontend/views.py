#    Copyright (C) 2017 Zaur Nasibov and contributors
#
#    This file is part of Minicash.

#    Minicash is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.

#    Foobar is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.

#    You should have received a copy of the GNU General Public License
import json
import logging

from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from minicash.utils.json import JSONEncoder
from .context import build_context


logger = logging.getLogger(__name__)


@login_required
def index(request):
    minicash_context = build_context(user=request.user)

    minicash_json_context = json.dumps(minicash_context, cls=JSONEncoder)
    logger.debug('JSON context: %s', minicash_json_context)

    context = {'minicash_context': minicash_json_context}
    return render(request, 'frontend/index.html', context)

