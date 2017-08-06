Feature: Navigation

  Scenario: Access the home tab

    Given an anonymous user
    When I submit a valid login page
    Then the result page lands on "home" tab


  Scenario: Access the `New record` tab

    Given an authenticated user
    When I navigate to "record" tab
    Then the result page lands on "record" tab
