from django.utils.functional import Promise
from django.utils.encoding import force_text
from django.core.serializers.json import DjangoJSONEncoder


class JSONEncoder(DjangoJSONEncoder):
    def default(self, obj):  # pylint: disable=arguments-differ,method-hidden; -- false positives
        # Encode lazy translations properly
        if isinstance(obj, Promise):
            return force_text(obj)
        return super().default(obj)
