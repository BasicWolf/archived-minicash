from behave import then
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from minicash.utils.testing import jswait, jsget

import logging
logger = logging.getLogger(__name__)

@then('the result page lands on "{tab_name}" tab')
def step_result_page_lands_on_tab(context, tab_name):
    br = context.browser
    test = context.test

    jswait(br, 5, 'minicash.started', True)
    test.assertEqual(tab_name, jsget(br, 'minicash.controllers.tabs.getCurrentTab().get("name")'))

    # context.test.assertTrue(br.current_url.endswith(''), f'Current URL is {br.current_url}')
