import { Given, Then, And, When, Before } from "cypress-cucumber-preprocessor/steps"

Before(function () {
    cy.intercept("GET", "http://localhost:8082/imapi/api/entity/public/iriExists?iri=http:%2F%2Fsnomed.info%2Fsct%2333737001", {
        statusCode: 200,
        body: {}
    })
})

Given("I'm on the main page", () => {
    cy.visit("/#/concept/http:%2F%2Fsnomed.info%2Fsct%2333737001");
});

Then("the snomed license is displayed", () => {
    cy.get(".p-dialog-title").should("exist");
    cy.url().should("include", "/snomedLicense");
});

And(/^the license hasn't been accepted$/, function () {
    localStorage.removeItem('snomedLicenseAccepted')
});

When(/^"([^"]*)" button is clicked$/, function (buttonText) {
    cy.get(".p-button-label")
        .contains(buttonText)
        .click();
});

Then(/^License is accepted$/, function () {
    expect(localStorage.getItem("snomedLicenseAccepted")).to.eq('true')
    cy.url().should("include", "concept");
});

Given(/^the license has been previously accepted$/, function () {
    localStorage.setItem('snomedLicenseAccepted', 'true')
});

Then(/^License is not displayed$/, function () {
    cy.get(".p-dialog-title").should("not.exist");
});
