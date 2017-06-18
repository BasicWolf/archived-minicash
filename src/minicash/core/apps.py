from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'minicash.core'
    label = 'minicash_core'

    def ready(self):
        import minicash.core.checks  # noqa: F401; pylint: disable=unused-variable
