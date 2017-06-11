# Required environmental variables:
# * DATABASE_URL
# * MINICASH_LOCAL_DIR
# * MINICASH_SECRET_KEY

from .base import *

DEBUG = False


# Allow all host headers
ALLOWED_HOSTS = ['*']


# Simplified static file serving.
# https://warehouse.python.org/project/whitenoise/
STATICFILES_STORAGE = 'whitenoise.django.GzipManifestStaticFilesStorage'


# Honor the 'X-Forwarded-Proto' header for request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
