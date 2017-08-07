import logging
import types
from functools import partial
from typing import Any, Dict, Type

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support.ui import WebDriverWait

from django.conf import settings
from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY, HASH_SESSION_KEY
from django.contrib.auth.models import User
from django.contrib.sessions.backends.db import SessionStore
from django.urls import reverse

logger = logging.getLogger(__name__)


def before_all(context):
    if not context.config.log_capture:
        logging.basicConfig(level=logging.DEBUG)

    context.browser = webdriver.Firefox()
    context.browser.implicitly_wait(1)
    context.server_url = 'http://localhost:8000'

    # monkey-patch context with utility functions
    context.authenticate_user = partial(authenticate_user, context)
    context.jsget = partial(jsget, context.browser)
    context.jswait = partial(jswait, context.browser)
    context.url = partial(url, context)
    context.__class__.item = property(_get_item)


def after_all(context):
    # Explicitly quits the browser, otherwise it won't once tests are done
    context.browser.quit()


def before_feature(context, feature):
    # Code to be executed each time a feature is going to be tested
    pass


def jswait(br, timeout, js_expr, expected_value):
    return WebDriverWait(br, timeout).until(
        lambda *args: jsget(br, js_expr) == expected_value
    )


def url(context, path):
    return f'{context.base_url}{path}'


def jsget(br, js_expr):
    ret_js_expr = 'return ' + js_expr
    return br.execute_script(ret_js_expr)


def authenticate_user(context, user) -> None:
    """Authenticates the user on a WebDriver instance"""
    br = context.browser
    br.get(context.url(reverse('logout')))
    session_cookie = _create_session_cookie(user)
    br.add_cookie(session_cookie)
    br.refresh()


def _get_item(context) -> Dict:
    table = getattr(context, 'table', [])
    if table:
        item = table[0]
        ret = {name: item[name] for name in item.headings}
    else:
        ret = {}

    return ret


def _create_session_cookie(user: Type[User]) -> Dict[str, Any]:
    '''Returns an authenticated session cookie dictionary for the given user.'''
    # Create the authenticated session using the new user credentials
    session = SessionStore()
    session[SESSION_KEY] = user.pk
    session[BACKEND_SESSION_KEY] = settings.AUTHENTICATION_BACKENDS[0]
    session[HASH_SESSION_KEY] = user.get_session_auth_hash()
    session.save()

    cookie = {
        'name': settings.SESSION_COOKIE_NAME,
        'value': session.session_key,
        'secure': False,
        'path': '/',
    }
    return cookie


def check_browser_errors(br):
    """
    Checks browser for errors, returns a list of errors
    :param br:
    :return:
    """
    try:
        browserlogs = br.get_log('browser')
    except (ValueError, WebDriverException) as e:
        # Some browsers does not support getting logs
        logger.debug("Could not get browser logs for driver %s due to exception: %s",
                     br, e)
        return []

    errors = []
    for entry in browserlogs:
        # if entry['level'] == 'SEVERE':
        errors.append(entry)
    return errors
