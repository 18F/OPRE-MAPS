/// <reference types="cypress" />
import { terminalLog, testLogin } from "./utils";

beforeEach(() => {
    testLogin("admin");
    cy.visit("/agreements/1");
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("agreement loads with details", () => {
    cy.get("h1").contains("Contract #1: African American Child and Family Research Center");
    cy.get("h2").first().contains("Human Services Interoperability Support");
    cy.get("h2").eq(1).contains("Agreement Details");
    cy.get('[data-cy="details-left-col"] > :nth-child(1) > .text-base-dark').contains("Description");
    cy.get('[data-cy="details-right-col"] > :nth-child(1) > :nth-child(1)').contains("Agreement Type");
    cy.get('[data-cy="details-right-col"] > :nth-child(1) > :nth-child(2) > .font-12px').contains("Contract");
    cy.get('[data-cy="details-right-col"] > :nth-child(1) > :nth-child(3)').contains("Product Service Code");
    cy.get('[data-cy="details-left-col"] > :nth-child(2)').contains("Notes");
    cy.get("p.font-12px").contains("There are currently no notes for this agreement.");
});

it("agreement loads with budget lines", () => {
    cy.get('[data-cy="details-tab-Budget Lines"]').click();
    cy.get('[data-cy="currency-summary-card"]').contains("Agreement Total");
    cy.get('[data-cy="currency-summary-card"]').contains("$ 0");
    cy.get('[data-cy="blis-by-fy-card"]').should("exist");
    cy.get("tbody").children().as("table-rows").should("have.length", 2);
    // toggle on Draft BLIs
    cy.get("#toggleDraftBLIs").should("exist");
    cy.get("#toggleDraftBLIs").click();
    cy.get('[data-cy="currency-summary-card"]').contains("$ 2,000,000.00");
    cy.get('[data-cy="blis-by-fy-card"]').contains("$2,000,000.00");
});

it("should not warn when not making changes to agreement and tabbing to BLI tab", () => {
    cy.get("#edit").click();
    cy.get('[data-cy="details-tab-Budget Lines"]').click();
    cy.get("#ops-modal").should("not.exist");
});

it("should warn when making changes to agreement and tabbing out", () => {
    cy.get("#edit").click();
    cy.get("#contractType").select("Firm Fixed Price (FFP)");
    cy.get('[data-cy="details-tab-Agreement Details"]').click();
    cy.get("#ops-modal").should("exist");
});
