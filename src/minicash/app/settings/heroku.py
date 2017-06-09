# Required environmental variables:
# * DATABASE_URL
# * MINICASH_LOCAL_DIR
# * MINICASH_SECRET_KEY

from .base import *

DEBUG = True


# Allow all host headers
ALLOWED_HOSTS = ['*']


INSTALLED_APPS += [
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
]


# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
