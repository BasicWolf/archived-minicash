#
#
#
# Define:
# * MINICASH_LOCAL_DIR
# * MINICASH_SECRET_KEY

from .base import *

import os


LOCAL_DIR = os.environ['MINICASH_LOCAL_DIR']


DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME':  os.path.join(LOCAL_DIR, 'db.sqlite3'),
    }
}


