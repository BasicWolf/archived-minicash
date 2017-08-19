from moneyed import Money

from behave import then, when
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

from django.urls import reverse

from minicash.core.models import Record


@when('I wait for "{timeout}" seconds')
def step_wait(context, timeout):
    context.sleep(int(timeout))


@when('I navigate to "{route}"')
def step_nagivate_to_tab(context, route):
    br = context.browser
    br.get(context.minicash.url_reverse(route))

@when('I fill record tab with data')
def fill_record_with_data(context):
    item = context.item

    tab_el = context.minicash.get_active_tab()
    form = tab_el.find_element_by_xpath('.//form')

    # mode
    mode_select = Select(form.find_element_by_xpath('.//select[@name="mode"]'))
    mode_select.select_by_value(str(getattr(Record, item['Mode'])))

    # date/time
    created_dt_el = form.find_element_by_xpath('.//input[@name="created_dt"]')
    created_dt_el.clear()
    created_dt_el.send_keys(item['Date/Time'])

    # withdrawn from account
    asset_from_el = Select(form.find_element_by_xpath('.//select[@name="asset_from"]'))
    asset_from_el.select_by_value(item['From'])

    # expense
    expense_el = form.find_element_by_xpath('.//input[@name="delta"]')
    expense_el.send_keys(item['Expense'])

    # tags
    tags_select = form.find_element_by_xpath('.//select[@name="tags"]')
    tags_input = tags_select.find_element_by_xpath('.//following-sibling::span[1]//descendant::input[contains(@class,"select2-search__field")]')
    for tag in item['Tags'].split(' '):
        tags_input.send_keys(tag)
        tags_input.send_keys(Keys.RETURN)

    # description
    description_el = form.find_element_by_xpath('.//textarea[@name="description"]')
    description_el.send_keys(item['Description'])


@when('I click save button')
def step_click_button(context):
    save_btn = context.minicash.get_active_tab().find_element_by_xpath('.//button[@data-spec="save"]')
    save_btn.click()


@then('"{tab_title}" tab is activated')
def step_tab_is_activated(context, tab_title):
    context.jswait('minicash.controllers.tabs.getActiveTab().get("title")', tab_title)


@then('the result page lands on "{tab_title}" tab')
def step_result_page_lands_on_tab(context, tab_title):
    context.jswait('minicash.started', True)
    step_tab_is_activated(context, tab_title)


@then('record exist on the backend')
def step_records_exists_on_backend(context):
    test = context.test
    item = context.item
    record = Record.objects.get(description=item['description'])
    test.assertEqual(getattr(Record, item['mode']), record.mode)
    test.assertEqual(item['created_dt'],
                     record.created_dt.strftime(context.user.profile.date_time_format))
    currency = record.delta.currency
    test.assertAlmostEqual(Money(item['delta'], currency), record.delta, places=2)
    test.assertEqual(item['tags'], ' '.join(tag.name for tag in record.tags.all()))
