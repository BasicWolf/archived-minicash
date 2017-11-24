Feature: Records tab
  # Scenario: Single page pagination
  #   Given an authenticated user
  #   And 10 random records
  #   When I navigate to "tab_records"
  #   Then paginator has 1 pages
  #   And paginator active page is 1

  # Scenario: Default view is Grouped
  #   Given an authenticated user
  #   And 10 random records
  #   When I navigate to "tab_records"
  #   Then view is in grouped mode

  # Scenario: Switch grouped view to flat and back
  #   Given an authenticated user
  #   And 10 random records
  #   When I navigate to "tab_records"
  #   And I click mode switch
  #   Then view is in flat mode
  #   When I click mode switch
  #   Then view is in grouped mode

  Scenario: grouped records
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |   pk | owner | name | balance | initial_balance |
      | 2000 |   200 | CA   |    1200 |            1200 |
    And records
       | mode    | created_dt       | asset_from | delta | tags        | description        | owner |
       | EXPENSE | 2017-10-15 22:18 |       2000 |   100 | hello world | description for__1 |   200 |
       | EXPENSE | 2017-10-15 22:18 |       2000 |   200 | hello hi    | description for__2 |   200 |
       | EXPENSE | 2017-10-15 22:18 |       2000 |   300 | hello Alex  | description for__3 |   200 |
    And 10 random records
    When I navigate to "tab_records"
    And I expand first records group
    And I wait for 10 seconds
#    Then first grouped record total delta is 600
