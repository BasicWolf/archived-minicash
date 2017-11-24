from behave import then, when


@when('I wait for {timeout} seconds')
def step_wait(context, timeout):
    context.sleep(int(timeout))


@when('I navigate to "{route}"')
def step_nagivate_to_tab(context, route):
    br = context.browser
    br.get(context.minicash.url_reverse(route))


@when('I click "{button}" panel button')
def step_click_button(context, button):
    btn = context.minicash.get_active_tab().find_element_by_xpath(f'.//*[@data-spec="{button}"]')
    btn.click()


@then('"{tab_title}" tab is activated')
def step_tab_is_activated(context, tab_title):
    context.jswait('minicash.controllers.tabs.getActiveTab().get("title")', tab_title)


@then('the result page lands on "{tab_title}" tab')
def step_result_page_lands_on_tab(context, tab_title):
    context.jswait('minicash.started', True)
    step_tab_is_activated(context, tab_title)


@then('paginator has {count:int} pages')
def step_paginator_has_pages(context, count):
    test = context.test
    paginator = context.minicash.get_active_tab().find_element_by_xpath('.//ul[contains(@class, "pagination")]')
    pages = paginator.find_elements_by_xpath('.//li')
    # count + "previous" and "next" buttons
    test.assertEqual(count + 2, len(pages))


@then('paginator active page is {number}')
def step_paginator_active_page_is(context, number):
    test = context.test
    paginator = context.minicash.get_active_tab().find_element_by_xpath('.//ul[contains(@class, "pagination")]')
    active_page = paginator.find_element_by_xpath('.//li[@class="active"]')
    test.assertEqual('1', active_page.text)
