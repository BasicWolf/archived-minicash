from behave import then, when

from django.urls import reverse


@when('I navigate to root')
def step_navigate_to_root(context):
    br = context.browser
    br.get(context.base_url)


@when('I navigate to "{tab_name}" tab')
def step_nagivate_to_tab(context, tab_name):
    br = context.browser
    br.get(context.url(reverse('tabs_route', args=('record', ))))


#@when('I fill record tab with data')

@then('the result page lands on "{tab_name}" tab')
def step_result_page_lands_on_tab(context, tab_name):
    test = context.test

    context.jswait(5, 'minicash.started', True)
    test.assertEqual(tab_name, context.jsget('minicash.controllers.tabs.getCurrentTab().get("name")'))

