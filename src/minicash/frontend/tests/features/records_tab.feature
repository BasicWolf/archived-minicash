Feature: Records tab
  Scenario: Single page pagination
    Given "1" records
    When I navigate to "tab_records"
    Then paginator has "1" pages
#    And paginator active page number is "1"
