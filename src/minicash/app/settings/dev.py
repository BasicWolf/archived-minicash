from .base import *


DEBUG = True


INSTALLED_APPS += [
    'django.contrib.staticfiles',

    'behave_django',
    'django_extensions',
    'django_pdb',
]


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,

    'formatters': {
        'verbose': {
            'format': '%(levelname)s - [%(asctime)s] - %(filename)s:%(lineno)s - %(message)s'
        },
        'simple': {
            'format': '%(levelname)s - [%(asctime)s] - %(message)s',
            'datefmt': '%d/%m/%Y %H:%M:%S',
        },
    },

    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },

    'loggers': {
        'minicash': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}

MINICASH['PAGINATOR_DEFAULT_PAGE_SIZE'] = 20
