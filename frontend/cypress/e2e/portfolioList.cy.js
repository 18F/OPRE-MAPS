import { terminalLog, testLogin } from "./utils";

beforeEach(() => {
    testLogin("admin");
    cy.visit("/portfolios");
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("loads", () => {
    cy.get("h1").should("have.text", "Portfolios");
    cy.get('a[href="/portfolios/1"]').should("exist");
});

it("clicking on a Portfolio takes you to the detail page", () => {
    const portfolioName = "Healthy Marriage & Responsible Fatherhood";

    cy.contains(portfolioName).click();

    cy.url().should("include", "/portfolios/6");
    cy.get("h1").should("contain", portfolioName);
});
