Feature: Login form

  Scenario: Access the login form

    Given an anonymous user
    When I submit a valid login page
    Then I am redirected to the root

  Scenario: Acess by authenticated user

    Given an authenticated user
    When I navigate to root
    Then the result page lands on "home" tab

