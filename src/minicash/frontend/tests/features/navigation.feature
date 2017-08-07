Feature: Navigation

  Scenario: Access the `New record` tab
  
    Given an authenticated user
    When I navigate to "record" tab
    Then the result page lands on "record" tab
