from behave import when


@when('I click "{button}" in modal dialog')
def step_click_button_in_modal_dialog(context, button):
    br = context.browser
    context.sleep(1)
    btn = br.find_element_by_xpath(f'//div[@class="modal-dialog"]//button[@data-bb-handler="{button}"]')
    btn.click()
    context.sleep(1)
