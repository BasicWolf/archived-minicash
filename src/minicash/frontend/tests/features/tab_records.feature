Feature: Records tab
  Scenario: Single page pagination
    Given an authenticated user
    And 10 random records
    When I navigate to "tab_records"
    Then paginator has 1 pages
    And paginator active page is "1"
