from behave import when, then


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
def view_in_flat_mode(context):
    tab_el = context.minicash.get_active_tab()
    tab_el.find_element_by_xpath('.//table[@data-spec="flat-records-table"]')


@when('I expand first records group')
def expand_records_group(context):
    tab_el = context.minicash.get_active_tab()
    toogle_records_group_btn = tab_el.find_elements_by_xpath('.//button[@data-spec="toggle-records-group"]')[0]
    toogle_records_group_btn.click()


@then('first grouped record total delta is "{delta}"')
def grouped_records_delta_is(context, delta):
    tab_el = context.minicash.get_active_tab()
    delta_cell = tab_el.find_element_by_xpath('.//button[@data-spec="toggle-records-group"]/../../td[@class="delta"]')
    context.test.assertEqual(delta, delta_cell.text)


@then('first grouped records table has {count} rows')
def grouped_records_table_has_rows(context, count):
    tab_el = context.minicash.get_active_tab()
    records_group_table = tab_el.find_elements_by_xpath('.//table[@data-spec="records_group_table"]')[0]
    rows = records_group_table.find_elements_by_xpath('.//tbody//tr')
    context.test.assertEqual(3, len(rows))
