Feature: Login form

  Scenario: Access the login form
    Given a user
      | username | password |
      | alex     | mypasswd |
    When I submit a login page ("alex", "mypasswd")
    Then the result page lands on "home" tab

  Scenario: Acess by authenticated user
    Given an authenticated user
    When I navigate to root
    Then the result page lands on "home" tab
