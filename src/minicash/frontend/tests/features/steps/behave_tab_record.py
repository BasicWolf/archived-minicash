from behave import when

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

from minicash.core.models import Record


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
    if 'From' in item:
        asset_from_el = Select(form.find_element_by_xpath('.//select[@name="asset_from"]'))
        asset_from_el.select_by_value(item['From'])

    if 'To' in item:
        asset_to_el = Select(form.find_element_by_xpath('.//select[@name="asset_to"]'))
        asset_to_el.select_by_value(item['To'])

    # expense
    if 'Expense' in item:
        expense_el = form.find_element_by_xpath('.//input[@name="delta"]')
        expense_el.send_keys(item['Expense'])

    # tags
    if 'Tags' in item:
        tags_select_el = form.find_element_by_xpath('.//select[@name="tags"]')
        fill_tags(tags_select_el, item['Tags'].split(' '))

    # description
    if 'Description' in item:
        description_el = form.find_element_by_xpath('.//textarea[@name="description"]')
        description_el.send_keys(item['Description'])


@when('I switch to multi-entries mode')
def switch_to_multi_entries_mode(context):
    switch = context.minicash.get_active_tab().find_element_by_xpath(
        './/input[@data-spec="single-multi"]/preceding-sibling::span[@class="bootstrap-switch-label"]')
    switch.click()


@when('I fill last multi-entry row with data')
def fill_multi_entry_row_with_data(context):
    item = context.item
    tab_el = context.minicash.get_active_tab()

    entries_tbody = tab_el.find_element_by_xpath(
        './/tbody[@data-spec="multi-entries-tbody"]')
    last_entry_row = entries_tbody.find_element_by_xpath('.//tr[last()]')

    if 'Expense' in item:
        expense_el = last_entry_row.find_element_by_xpath('.//input[@data-spec="delta-input"]')
        expense_el.send_keys(item['Expense'])

    if 'Tags' in item:
        tags_select_el = last_entry_row.find_element_by_xpath('.//select[@data-spec="tags-select"]')
        fill_tags(tags_select_el, item['Tags'].split(' '))

    if 'Description' in item:
        description_el = last_entry_row.find_element_by_xpath('.//input[@data-spec="description-input"]')
        description_el.send_keys(item['Description'])


def fill_tags(tags_select_el, tags):
    tags_input = tags_select_el.find_element_by_xpath(
        './/following-sibling::span[1]//descendant::input[contains(@class,"select2-search__field")]')
    for tag in tags:
        tags_input.send_keys(tag)
        tags_input.send_keys(Keys.RETURN)
