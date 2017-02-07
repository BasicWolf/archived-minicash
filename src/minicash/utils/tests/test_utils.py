import json

from ..testing import TestCase
from ..json import JSONEncoder


class TestJSON(TestCase):

    def test_lazy_translation(self):
        from django.utils.translation import ugettext_lazy as _
        obj = {'message': _('Hello world')}
        data = json.dumps(obj, cls=JSONEncoder)
        self.assertIn('Hello world', data)
