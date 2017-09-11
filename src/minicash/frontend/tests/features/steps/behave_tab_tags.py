from behave import when


@when('I select {tags_count} tags')
def step_select_tags(context, tags_count):
    tags_count = int(tags_count)
    test = context.test
    checkboxes = context.minicash.get_active_tab().find_elements_by_xpath('.//input[@data-spec="select-tag"]')
    test.assertEqual(3, len(checkboxes))

    for i in range(tags_count):
        checkboxes[i].click()
