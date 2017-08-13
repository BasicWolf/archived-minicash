Feature: Navigation

  Scenario: Access the `New record` tab

    Given an authenticated user
    When I navigate to "record" tab
    And I wait for "30" seconds
    Then the result page lands on "record" tab
