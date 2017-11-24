from behave import given, when, then


@then('view is in grouped mode')
def view_in_grouped_mode(context):
    tab_el = context.minicash.get_active_tab()
    tab_el.find_element_by_xpath('.//table[@data-spec="grouped-records-table"]')


@when('I click mode switch')
def switch_view_to_flat_mode(context):
    switch = context.minicash.get_active_tab().find_element_by_xpath(
        './/input[@data-spec="flat-grouped"]/preceding-sibling::span[@class="bootstrap-switch-label"]')
    switch.click()


@then('view is in flat mode')
def switch_view_to_flat_mode(context):
    tab_el = context.minicash.get_active_tab()
    tab_el.find_element_by_xpath('.//table[@data-spec="flat-records-table"]')


@when('I expand first records group')
def expand_records_group(context):
    tab_el = context.minicash.get_active_tab()
    toogle_records_group_btn = tab_el.find_element_by_xpath('.//button[@data-spec="toggle-records-group"]')[1]
    toogle_records_group_btn.click()
