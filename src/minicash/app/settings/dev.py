from .base import *


DEBUG = True


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


INSTALLED_APPS += [
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


SECRET_KEY = '4p@7r0o9ovpzzxli(_!x_-xy)$ug3f4wnjntauz@(de8z2!$)o'
