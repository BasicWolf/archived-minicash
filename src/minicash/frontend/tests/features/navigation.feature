Feature: Navigation

  Scenario: Access the `New record` tab

    Given an authenticated user
    When I navigate to "tab_new_record"
    Then the result page lands on "New record" tab
