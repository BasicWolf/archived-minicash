from behave import then, when
from selenium.webdriver.support.ui import Select

from django.urls import reverse

from minicash.core.models import Record


@when('I navigate to root')
def step_navigate_to_root(context):
    br = context.browser
    br.get(context.base_url)


@when('I navigate to "{tab_name}" tab')
def step_nagivate_to_tab(context, tab_name):
    br = context.browser
    br.get(context.url(reverse('tabs_route', args=('record', ))))


@when('I fill record tab with data')
def fill_record_with_data(context):
    br = context.browser
    test = context.test
    tab_name = context.jsget('minicash.controllers.tabs.getCurrentTab().get("name")');
    tab_elem = br.find_element_by_id(f'tab_{tab_name}')
    # mode
    mode_select = Select(tab_elem.find_element_by_xpath(".//form//select[@name='mode']"))
    mode_select.select_by_value(str(Record.EXPENSE))

    pass

@then('the result page lands on "{tab_name}" tab')
def step_result_page_lands_on_tab(context, tab_name):
    test = context.test

    context.jswait(5, 'minicash.started', True)
    br_tab_name = context.jsget('minicash.controllers.tabs.getCurrentTab().get("name")');
    test.assertTrue(tab_name, br_tab_name)
