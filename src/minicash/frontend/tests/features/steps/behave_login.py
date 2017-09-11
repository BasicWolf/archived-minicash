from behave import given, when, then

from django.contrib.auth import get_user_model

from minicash.auth.tests.factories import UserFactory


@given('a user')
def a_user(context):
    UserFactory.create(**context.item)


@given('an authenticated user')
def step_authenticated_user(context):
    user = UserFactory.create(**context.item)
    context.minicash.authenticate_user(user)


@given('an authenticated user ("{pk}")')
def step_authenticated_user_pk(context, pk):
    user = get_user_model().objects.get(pk)
    context.minicash.authenticate_user(user)


@when('I submit a login page ("{username}", "{password}")')
def step_submit_login_page(context, username, password):
    br = context.browser
    br.get(context.minicash.url_reverse('login'))

    context.test.assertTrue(br.find_element_by_name('csrfmiddlewaretoken').is_enabled(),
                            'CSRF protection is not enabled')

    # Fill login form and submit it (valid version)
    br.find_element_by_name('username').send_keys(username)
    br.find_element_by_name('password').send_keys(password)
    br.find_element_by_name('submit').click()


@then('I am redirected to the root')
def step_redirect_to_root(context):
    br = context.browser
    context.test.assertTrue(br.current_url.endswith('/'), f'Current URL is {br.current_url}')


@when('I submit an invalid login page')
def step_submit_invalid_login_page(context):
    br = context.browser

    br.get(context.base_url + '/login/')

    context.test.assertTrue(br.find_element_by_name('csrfmiddlewaretoken').is_enabled(),
                            'CSRF protection is not enabled')

    # Fill login form and submit it (invalid version)
    br.find_element_by_name('username').send_keys('foo')
    br.find_element_by_name('password').send_keys('bar-is-invalid')
    br.find_element_by_name('submit').click()


@then('I am redirected to the login fail page')
def step_redirect_to_login_fail_page(context):
    br = context.browser

    # Checks redirection URL
    assert br.current_url.endswith('/login/fail/')
    assert br.find_element_by_id('main_title').text == "Login failure"
