Feature: Records management

  Scenario: Save expense record
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |  pk | owner | name | balance | initial_balance |
      | 2000 |   200 | CA   |    1200 |            1200 |
    When I navigate to "tab_new_record"
    And I fill record tab with data
      | Mode    | Date/Time        | From | Expense | Tags        | Description           |
      | EXPENSE | 07/08/2017 22:18 | 2000 |     111 | hello world | description for__2000 |
    And I click "save" panel button
    Then "Home" tab is activated
    And record exist on the backend
      | mode    | created_dt       | asset_from | delta | tags        | description           |
      | EXPENSE | 07/08/2017 22:18 |       2000 |   111 | hello world | description for__2000 |
    And asset exists on the backend
      |   pk | balance |
      | 2000 |    1089 |


  Scenario: Save income record
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |   pk | owner | name | balance | initial_balance |
      | 2010 |   200 | CA   |    1200 |            1200 |
    When I navigate to "tab_new_record"
    And I fill record tab with data
      | Mode   | Date/Time        |   To | Expense | Tags        | Description           |
      | INCOME | 07/08/2017 22:18 | 2010 |     100 | hello world | description for__2010 |
    And I click "save" panel button
    Then "Home" tab is activated
    And record exist on the backend
      | mode   | created_dt       | asset_to | delta | tags        | description           |
      | INCOME | 07/08/2017 22:18 |     2010 |   100 | hello world | description for__2010 |
    And asset exists on the backend
      |   pk | balance |
      | 2010 |    1300 |

  Scenario: Save single expense record in multi-mode
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |  pk | owner | name | balance | initial_balance |
      | 2000 |   200 | CA   |    1200 |            1200 |
    When I navigate to "tab_new_record"
    And I switch to multi-entries mode
    And I fill record tab with data
      | Mode    | Date/Time        | From |
      | EXPENSE | 07/08/2017 22:18 | 2000 |
    And I fill last multi-entry row with data
      | Expense | Tags        | Description           |
      |     111 | hello world | description for__2000 |
    And I click "save" panel button
    Then "Home" tab is activated
    And record exist on the backend
       | mode    | created_dt       | asset_from | delta | tags        | description           |
       | EXPENSE | 07/08/2017 22:18 |       2000 |   111 | hello world | description for__2000 |
    And asset exists on the backend
      |   pk | balance |
      | 2000 |    1089 |


  Scenario: Save multiple expense records in multi-mode
    Given an authenticated user
      |  pk |
      | 200 |
    And assets
      |  pk | owner | name | balance | initial_balance |
      | 2000 |   200 | CA   |    1200 |            1200 |
    When I navigate to "tab_new_record"
    And I switch to multi-entries mode
    And I fill record tab with data
      | Mode    | Date/Time        | From |
      | EXPENSE | 07/08/2017 22:18 | 2000 |
    And I fill last multi-entry row with data
      | Expense | Tags        | Description           |
      |     111 | hello world | description for__2000 |
    And I click "save" panel button
    Then "Home" tab is activated
    And record exist on the backend
       | mode    | created_dt       | asset_from | delta | tags        | description           |
       | EXPENSE | 07/08/2017 22:18 |       2000 |   111 | hello world | description for__2000 |
    And asset exists on the backend
      |   pk | balance |
      | 2000 |    1089 |

