Feature: Records management

  Scenario: Save record
    Given an authenticated user
      | pk  |
      | 200 |
    Given assets
      | pk  | owner | name | balance | initial_balance |
      | 200 | 200   | CA   | 1200    | 1200            |
    When I navigate to "record" tab
    When I fill record form with data
      | Mode      | Date/Time        | From | Tags        | Description   |
      | Expense   | 07/08/2017 22:18 | 200  | hello world | some descript |
    # When I click `Save button`
    # Then records are saved to the backend
    #   | PK  |
    #   | 100 |
    # Then "record" tab disappears
