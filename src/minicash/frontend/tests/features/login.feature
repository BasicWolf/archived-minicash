Feature: Login form

  Scenario: Access the login form
    Given a user
      | username | password |
      | alex     | mypasswd |
    When I submit a login page ("alex", "mypasswd")
    Then the result page lands on "Home" tab

  Scenario: Acess by authenticated user
    Given an authenticated user
    When I navigate to "index"
    Then the result page lands on "Home" tab
