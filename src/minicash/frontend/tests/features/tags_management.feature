Feature: Tags management

  Scenario: Delete multiple tags
    Given an authenticated user
      |  pk |
      | 200 |
    And tags
      |   pk | owner | name |
      | 3000 |   200 | TAG1 |
      | 3010 |   200 | TAG2 |
      | 3020 |   200 | TAG3 |

    When I navigate to "tab_tags"
    And I select 2 items
    And I click "delete-tag" panel button
    And I click "Yes" in modal dialog

    Then tags count on the backend is "1"
    And tags exist on the backend
      |   pk | name |
      | 3020 | TAG3 |
