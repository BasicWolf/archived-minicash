Feature: Navigation

  Scenario: Access the home tab

    Given an anonymous user
    When I submit a valid login page
    Then the result page lands on "home" tab

