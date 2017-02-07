from behave import given, when, then

from minicash.auth.tests.factories import UserFactory


@given('an anonymous user')
def step_anon_user(context):
    # Creates a dummy user for our tests (user is not authenticated at this point)
    u = UserFactory(username='foo', email='foo@example.com')
    u.set_password('bar')
    u.save()


@when('I submit a valid login page')
def step_submit_login_page(context):
    br = context.browser
    br.get(context.base_url + '/login/')

    # Checks for Cross-Site Request Forgery protection input
    assert br.find_element_by_name('csrfmiddlewaretoken').is_enabled()

    # Fill login form and submit it (valid version)
    br.find_element_by_name('username').send_keys('foo')
    br.find_element_by_name('password').send_keys('bar')
    br.find_element_by_name('submit').click()


@then('I am redirected to the root')
def step_redirect_to_root(context):
    br = context.browser

    # Checks success status
    assert br.current_url.endswith('/')


@when('I submit an invalid login page')
def step_submit_invalid_login_page(context):
    br = context.browser

    br.get(context.base_url + '/login/')

    # Checks for Cross-Site Request Forgery protection input (once again)
    assert br.find_element_by_name('csrfmiddlewaretoken').is_enabled()

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
