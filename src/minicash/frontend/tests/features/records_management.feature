Feature: Records management

  Scenario: Save record
    Given an authenticated user
      | pk  |
      | 200 |
    Given assets
      | pk  | owner | name | balance | initial_balance |
      | 200 | 200   | CA   | 1200    | 1200            |
    When I navigate to "record" tab
    When I fill record tab with data
      | Mode      | Date/Time        | From  | Expense | Tags        | Description   |
      | EXPENSE   | 07/08/2017 22:18 | 200   |  111    | hello world | some descript |
    When I click Save button
    Then "home" tab is activated
    # Then records are saved to the backend
    #    | PK  |
    #    | 100 |

