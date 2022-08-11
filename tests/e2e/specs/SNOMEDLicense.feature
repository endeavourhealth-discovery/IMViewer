Feature: SNOMED License

  Scenario: SNOMED License
    Given the license hasn't been accepted
    And I'm on the main page
    Then the snomed license is displayed

  Scenario: Accept SNOMED License
    Given the license hasn't been accepted
    And I'm on the main page
    And the snomed license is displayed
    When "Agree" button is clicked
    Then License is accepted

  Scenario: SNOMED License accepted
    Given the license has been previously accepted
    And I'm on the main page
    Then License is not displayed
