from .base import *


DEBUG = True


MINICASH_DB_DIR = os.environ['MINICASH_DB_DIR']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(MINICASH_DB_DIR, 'db.sqlite3'),
    }
}


INSTALLED_APPS += [
    'whitenoise.runserver_nostatic',
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


SECRET_KEY = os.environ['MINICASH_SECRET_KEY']
