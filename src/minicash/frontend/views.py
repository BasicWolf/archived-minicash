import json
import logging

from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.base import TemplateView

from minicash.utils.json import JSONEncoder
from .context import build_context


logger = logging.getLogger(__name__)


class RouteView(LoginRequiredMixin, TemplateView):
    template_name = 'frontend/index.djhtml'

    def get_context_data(self, route=None, **kwargs):
        route = route or self.request.path
        minicash_context = build_context(user=self.request.user, route=route)
        minicash_context_json = json.dumps(minicash_context, cls=JSONEncoder)

        logger.debug('JSON context: %s', minicash_context_json)

        context = {'minicash_context': minicash_context_json}
        return context
