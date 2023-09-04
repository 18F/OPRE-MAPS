/// <reference types="cypress" />

import { terminalLog, testLogin } from "./utils";
// get current year
const today = new Date();
const year = today.getFullYear() + 1;
const month = today.getMonth() + 1;
const day = today.getDate();

const blData = [
    {
        descr: "SC1",
        can: "G99HRF2",
        month: "09 - Sep",
        day: "01",
        year: year,
        amount: "111111",
        note: "note one",
    },
];

const minAgreement = {
    agreement_type: "CONTRACT",
    name: "Test Contract",
    number: "TEST001",
    research_project_id: 1,
    procurement_shop_id: 1,
};

beforeEach(() => {
    testLogin("admin");
    cy.visit(`/`);
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("review an agreement", () => {
    expect(localStorage.getItem("access_token")).to.exist;

    // create test agreement
    const bearer_token = `Bearer ${window.localStorage.getItem("access_token")}`;
    cy.request({
        method: "POST",
        url: "http://localhost:8080/api/v1/agreements/",
        body: minAgreement,
        headers: {
            Authorization: bearer_token,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.id).to.exist;
        const agreementId = response.body.id;

        cy.intercept("PATCH", "**/agreements/**").as("patchAgreement");
        cy.visit(`/agreements/approve/${agreementId}?mode=review`);
        cy.get("h1").should("have.text", "Please resolve the errors outlined below");

        cy.get('[data-cy="error-list"]').should("exist");
        cy.get('[data-cy="error-item"]').should("have.length", 7);
        //send-to-approval button should be disabled
        cy.get('[data-cy="send-to-approval-btn"]').should("be.disabled");

        //fix errors
        cy.get('[data-cy="edit-agreement-btn"]').click();
        cy.get("#continue").click();
        // get all errors on page, should be 4
        cy.get(".usa-form-group--error").should("have.length", 4);
        cy.get("#description").type("Test Description");
        cy.get("#product_service_code_id").select(1);
        cy.get("#agreement_reason").select("NEW_REQ");
        cy.get("#project-officer-combobox-input").type("Chris Fortunato{enter}");
        cy.get("#agreementNotes").type("This is a note.");
        cy.get("[data-cy='continue-btn']").click();
        //create a budget line with errors
        cy.get("#add-budget-line").should("be.disabled");
        cy.get("#enteredDescription").type(`${blData[0].descr}`);
        cy.get("#enteredDescription").clear();
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredDescription").type(`${blData[0].descr}`);
        // add a CAN and clear it
        cy.get("#selectedCan").type(`${blData[0].can}{enter}`);
        cy.get(".usa-combo-box__clear-input").click();
        cy.get(".usa-error-message").should("exist");
        cy.get("#selectedCan").type(`${blData[0].can}{enter}`);
        // add entered month and clear it
        cy.get("#enteredMonth").select(blData[0].month);
        cy.get("#enteredMonth").select("0");
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredMonth").select(blData[0].month);
        // add entered day and clear it and tests for invalid days
        cy.get("#enteredDay").type(`${blData[0].day}`);
        cy.get("#enteredDay").clear();
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredDay").type("0");
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredDay").clear();
        cy.get("#enteredDay").type("32");
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredDay").clear();
        cy.get("#enteredDay").type(`${blData[0].day}`);
        // add entered year and clear it and tests for invalid years
        cy.get("#enteredYear").type(`${blData[0].year}`);
        cy.get("#enteredYear").clear();
        cy.get(".usa-error-message").should("exist");
        // check for invalid years
        cy.get("#enteredYear").type("0");
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type("12");
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type("123");
        cy.get(".usa-error-message").should("exist");
        // check to make sure the year is in the future
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type(`${year - 1}`);
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type(`${year}`);

        // TODO: check to ensure the group date is in the future
        cy.get("#enteredMonth").select(month);
        cy.get("#enteredDay").clear();
        cy.get("#enteredDay").type(blData[0].day);
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type(`${year - 1}`);
        // check for date to be in the future  which should error
        cy.get('[data-cy="date-group-errors"] .usa-error-message').should("exist");
        // fix by adding a valid date
        cy.get("#enteredDay").clear();
        cy.get("#enteredDay").type(blData[0].day + 1);
        cy.get("#enteredYear").clear();
        cy.get("#enteredYear").type(`${year + 1}`);
        cy.get('[data-cy="date-group-errors"] .usa-error-message').should("not.exist");
        // add entered amount and clear it
        cy.get("#enteredAmount").type(`${blData[0].amount}`);
        cy.get("#enteredAmount").clear();
        cy.get(".usa-error-message").should("exist");
        cy.get("#enteredAmount").type(`${blData[0].amount}`);
        cy.get("#add-budget-line").should("not.be.disabled");
        // add comment and clear it
        cy.get("#enteredComments").type(`${blData[0].note}`);
        cy.get("#enteredComments").clear();
        cy.get("#input-error-message").should("not.exist");
        cy.get("#enteredComments").type(`${blData[0].note}`);
        // add budget line
        cy.get("#add-budget-line").click();
        // go back to review page
        cy.get('[data-cy="continue-btn"]').click();
        cy.get("h1").should("not.have.text", "Please resolve the errors outlined below");
        cy.get('[data-cy="error-list"]').should("not.exist");
        cy.get('[data-cy="send-to-approval-btn"]').should("not.be.disabled");
        // go back to edit mode and look for budget line errors
        cy.visit(`/agreements/edit/${agreementId}?mode=edit`);
        cy.get("#continue").click();
        cy.get(".usa-form-group--error").should("not.exist");
        cy.get('[data-cy="continue-btn"]').click();
        // add incomplete budget line
        cy.get("#enteredDescription").type(`${blData[0].descr}`);
        cy.get("#add-budget-line").should("not.be.disabled");
        cy.get("#add-budget-line").click();
        // patch agreement
        cy.get('[data-cy="continue-btn"]').click();
        //check for new budget line errors
        cy.visit(`/agreements/approve/${agreementId}?mode=review`);
        cy.get("h1").should("have.text", "Please resolve the errors outlined below");
        cy.get('[data-cy="error-list"]').should("exist");
        cy.get('[data-cy="error-item"]').should("have.length", 1);
        //send-to-approval button should be disabled
        cy.get('[data-cy="send-to-approval-btn"]').should("be.disabled");
        // fix errors
        cy.get('[data-cy="edit-agreement-btn"]').click();
        cy.get("#continue").click();
        cy.get('[data-cy="continue-btn"]').click();
        // check for new budget line errors
        cy.get('[data-cy="error-item"]').should("exist");
        cy.get("tbody").children().as("table-rows").should("have.length", 2);
        cy.get("@table-rows").eq(0).find("[data-cy='expand-row']").click();
        cy.get("@table-rows").eq(0).find("[data-cy='expand-row']").click();
        cy.get("@table-rows").eq(0).find("[data-cy='expand-row']").click();
        cy.get("[data-cy='edit-row']").click();
        cy.get(".usa-form-group--error").should("have.length", 3);
        cy.get('[data-cy="update-budget-line"]').should("be.disabled");
        // fix errors
        cy.get("#selectedCan").type(`${blData[0].can}{enter}`);
        cy.get("#enteredMonth").select(blData[0].month);
        cy.get("#enteredDay").type(`${blData[0].day}`);
        cy.get("#enteredYear").type(`${blData[0].year}`);
        cy.get("#enteredAmount").type(`${blData[0].amount}`);
        cy.get("#enteredComments").type(`${blData[0].note}`);
        cy.get('[data-cy="update-budget-line"]').should("not.be.disabled");
        cy.get('[data-cy="update-budget-line"]').click();
        cy.get('[data-cy="error-item"]').should("not.exist");
        // patch agreement
        cy.get('[data-cy="continue-btn"]').click();
        //check review page
        cy.visit(`/agreements/approve/${agreementId}?mode=review`);
        cy.get("h1").should("not.have.text", "Please resolve the errors outlined below");
        cy.get('[data-cy="error-list"]').should("not.exist");
        cy.get('[data-cy="send-to-approval-btn"]').should("not.be.disabled");

        // delete test agreement
        cy.request({
            method: "DELETE",
            url: `http://localhost:8080/api/v1/agreements/${agreementId}`,
            headers: {
                Authorization: bearer_token,
                Accept: "application/json",
            },
        }).then((response) => {
            expect(response.status).to.eq(200);
        });
    });
});

it("submit agreement for review", () => {
    cy.visit(`/agreements/approve/1?mode=review`);
    cy.get("h1").should("not.have.text", "Please resolve the errors outlined below");
    cy.get('[data-cy="error-list"]').should("not.exist");
    cy.get('[data-cy="send-to-approval-btn"]').should("not.be.disabled");
    cy.get('[data-cy="send-to-approval-btn"]').click();
    cy.url().should("include", "/agreements");
    cy.get("tbody tr").contains("In Review");
});
