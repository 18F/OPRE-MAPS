/// <reference types="cypress" />
import { terminalLog, testLogin } from "./utils";

const ALL_BLI_TOTAL = "35,001,000.28";
const DRAFT_BLI_TOTAL = "2,000,000.00";
const IN_REVIEW_BLI_TOTAL = "0";
const EXECUTING_BLI_TOTAL = "16,000,000.08";
const PLANNED_BLI_TOTAL = "14,000,000.09";
const OBLIGATED_BLI_TOTAL = "3,001,000.11";

beforeEach(() => {
    testLogin("admin");
    cy.visit("/budget-lines");
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("loads", () => {
    cy.get("h1").should("have.text", "Budget Lines");
    cy.get("h2").should("have.text", "All Budget Lines");
});

it("budget line items link defaults to all-budget-line-items", () => {
    cy.visit("/");
    cy.get("a").contains("Budget Lines");
    cy.get('a[href="/budget-lines"]').should("exist");
});

it("clicking the add budget lines button takes you to the create budget lines page", () => {
    cy.get("a").contains("Add Budget Lines");
    cy.get('a[href="/budget-lines/create"]').should("exist");
});

it("pagination on the bli table works as expected", () => {
    // initial page load
    cy.get("ul").should("have.class", "usa-pagination__list");
    cy.get("li").should("have.class", "usa-pagination__item").contains("1");
    cy.get("a").should("have.class", "usa-current").contains("1");
    cy.get("li").should("have.class", "usa-pagination__item").contains("2");
    cy.get("li").should("have.class", "usa-pagination__item").contains("Next");
    cy.get("tbody").find("tr").should("have.length", 10);
    cy.get("li")
        .should("have.class", "usa-pagination__item")
        .contains("Previous")
        .find("svg")
        .should("have.attr", "aria-hidden", "true");

    // go to the second page
    cy.get("li").should("have.class", "usa-pagination__item").contains("2").click();
    cy.get("a").should("have.class", "usa-current").contains("2");
    cy.get("li").should("have.class", "usa-pagination__item").contains("Previous");
    cy.get("li")
        .should("have.class", "usa-pagination__item")
        .contains("Next")
        .find("svg")
        .should("have.attr", "aria-hidden", "true");

    // go back to the first page
    cy.get("li").should("have.class", "usa-pagination__item").contains("1").click();
    cy.get("a").should("have.class", "usa-current").contains("1");
});

it("the filter button works as expected", () => {
    cy.visit("/budget-lines");
    cy.get("button").contains("Filter").click();

    // set a number of filters

    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get(".fiscal-year-combobox__control")
        .click()
        .get(".fiscal-year-combobox__menu")
        .find(".fiscal-year-combobox__option")
        .first()
        .click();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get(".portfolios-combobox__control")
        .click()
        .get(".portfolios-combobox__menu")
        .find(".portfolios-combobox__option")
        .first()
        .click();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get(".bli-status-combobox__control")
        .click()
        .get(".bli-status-combobox__menu")
        .find(".bli-status-combobox__option")
        .first()
        .click();

    // click the button that has text Apply
    cy.get("button").contains("Apply").click();

    // check that the correct tags are displayed
    cy.get("div").contains("Filters Applied:").should("exist");
    cy.get("svg[id='filter-tag-fiscalYears']").should("exist");
    cy.get("svg[id='filter-tag-portfolios']").should("exist");
    cy.get("svg[id='filter-tag-bliStatus']").should("exist");

    cy.get("div").contains("FY 2012").should("exist");
    cy.get("div").contains("Child Welfare Research").should("exist");
    cy.get("div").contains("Draft").should("exist");

    // check that the table is filtered correctly
    cy.get("div[id='budget-line-items-table-zero-results']").should("exist");

    // reset
    cy.get("button").contains("Filter").click();
    cy.get("button").contains("Reset").click();
    cy.get("button").contains("Apply").click();

    // check that the correct tags are displayed
    cy.get("div").contains("Filters Applied:").should("not.exist");
    cy.get("svg[id='filter-tag-fiscalYears']").should("not.exist");
    cy.get("svg[id='filter-tag-portfolios']").should("not.exist");
    cy.get("svg[id='filter-tag-bliStatus']").should("not.exist");

    // check that the table is filtered correctly
    cy.get("div[id='budget-line-items-table-zero-results']").should("not.exist");
});

it("hover on table row displays icons", () => {
    cy.get("tbody").find("tr").first().trigger("mouseover");
    cy.get("tbody").find("tr").first().find('[data-cy="edit-row"]').should("exist");
    cy.get("tbody").find("tr").first().find('[data-cy="delete-row"]').should("exist");
    cy.get("tbody").find("tr").first().find('[data-cy="duplicate-row"]').should("not.exist");
});

it("click on chevron down should open row and see budgetline data", () => {
    cy.get("tbody").find('[data-cy="expanded-data"]').should("not.exist");
    cy.get("tbody").find("tr").first().find('[data-cy="expand-row"]').click();
    cy.get("tbody").find('[data-cy="expanded-data"]').as("expandedRow").should("exist");
    cy.get("@expandedRow").contains("Created By");
    cy.get("@expandedRow").contains("Notes");
    cy.get("@expandedRow").contains("Procurement Shop");
    cy.get("@expandedRow").contains("SubTotal");
    cy.get("@expandedRow").contains("Fees");
    cy.get("@expandedRow").find('[data-cy="edit-row"]').should("exist");
    cy.get("@expandedRow").find('[data-cy="delete-row"]').should("exist");
    cy.get("@expandedRow").find('[data-cy="duplicate-row"]').should("not.exist");
});

it("click on edit bli and check if its routed to the correct page", () => {
    cy.get("tbody").find("tr").first().trigger("mouseover");
    cy.get("tbody").find("tr").first().find('[data-cy="edit-row"]').should("exist");
    cy.get("tbody").find("tr").first().find('[data-cy="edit-row"]').click();
    cy.url().should("include", "/agreements/1/budget-lines");
});

it("click on edit bli and check to see if the form is populated", () => {
    cy.get("tbody").find("tr").first().trigger("mouseover");
    cy.get("tbody").find("tr").first().find('[data-cy="edit-row"]').should("exist");
    cy.get("tbody").find("tr").first().find('[data-cy="edit-row"]').click();
    cy.url().should("include", "/agreements/1/budget-lines");
    cy.get("#enteredDescription").should("have.value", "LI 1");
    cy.get("#selectedCan").should("have.value", "G994426");
    cy.get("#enteredMonth").should("have.value", "6");
    cy.get("#enteredDay").should("have.value", "13");
    cy.get("#enteredYear").should("have.value", "2043");
    cy.get("#enteredAmount").should("have.value", "1,000,000");
    cy.get('[data-cy="update-budget-line"]').should("exist");
});

it("Total BLI Summary Card should calculate the total amount of the budget line items", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    cy.get("@total-bli-card").contains("Budget Lines Total");
    cy.get("@total-bli-card").contains(ALL_BLI_TOTAL);
});

it("Total BLI Summary Card should calculate the total amount of the budget line items in draft status", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    filterByStatus("Draft");
    cy.get("@total-bli-card").contains(DRAFT_BLI_TOTAL);
});

it("Total BLI Summary Card should calculate the total amount of the budget line items in review status", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    filterByStatus("In Review");
    cy.get("@total-bli-card").contains(IN_REVIEW_BLI_TOTAL);
});

it("Total BLI Summary Card should calculate the total amount of the budget line items in executing status", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    filterByStatus("Executing");
    cy.get("@total-bli-card").contains(EXECUTING_BLI_TOTAL);
});

it("Total BLI Summary Card should calculate the total amount of the budget line items in planned status", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    filterByStatus("Planned");
    cy.get("@total-bli-card").contains(PLANNED_BLI_TOTAL);
});

it("Total BLI Summary Card should calculate the total amount of the budget line items in obligated status", () => {
    cy.get('[data-cy="bl-total-summary-card"]').as("total-bli-card").should("exist");
    filterByStatus("Obligated");
    cy.get("@total-bli-card").contains(OBLIGATED_BLI_TOTAL);
});

/**
 * Helper function to filter by status
 * @param {string} status - The status to filter by
 */
const filterByStatus = (status) => {
    cy.get("button").contains("Filter").click();
    cy.get(".flex-justify-end > .usa-button--outline").as("reset-btn").should("exist");
    cy.get("@reset-btn").click();
    cy.get(".bli-status-combobox__input-container").should("exist");
    cy.get(".bli-status-combobox__input-container").type(`${status}{enter}`);
    cy.get(".usa-button--primary").should("exist").click();
};
