Feature: Records management

  Scenario: Save record
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |  pk | owner | name | balance | initial_balance |
      | 200 |   200 | CA   |    1200 |            1200 |
    When I navigate to "tab_new_record"
    And I fill record tab with data
      | Mode    | Date/Time        | From | Expense | Tags        | Description             |
      | EXPENSE | 07/08/2017 22:18 |  200 |     111 | hello world | some descript _for__200 |
    And I click Save button
    Then "Home" tab is activated
    And record exist on the backend
      | mode    | created_dt       | asset_from | delta | tags        | description             |
      | EXPENSE | 07/08/2017 22:18 |        200 |   111 | hello world | some descript _for__200 |
