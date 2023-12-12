/// <reference types="cypress" />
import { terminalLog, testLogin } from "./utils";

beforeEach(() => {
    testLogin("admin");
    cy.visit("/agreements");
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("loads", () => {
    cy.get("h1").should("have.text", "Agreements");
});

it("Agreements list table has correct headers and first row", () => {
    cy.get(".usa-table").should("exist");
    cy.get("h1").should("exist");
    cy.get("h1").should("have.text", "Agreements");
    // table headers
    cy.get("thead > tr > :nth-child(1)").should("have.text", "Agreement");
    cy.get("thead > tr > :nth-child(2)").should("have.text", "Project");
    cy.get("thead > tr > :nth-child(3)").should("have.text", "Type");
    cy.get("thead > tr > :nth-child(4)").should("have.text", "Agreement Total");
    cy.get("thead > tr > :nth-child(5)").should("have.text", "Next Budget Line");
    cy.get("thead > tr > :nth-child(6)").should("have.text", "Next Need By");
    // first row (including tooltips)
    cy.get("tbody > :nth-child(1) > :nth-child(1) > a > .usa-tooltip > .usa-tooltip__trigger").should(
        "have.text",
        "Contract #1: African American Child and Family Research Center"
    );
    cy.get("tbody > :nth-child(1) > :nth-child(1) > a > .usa-tooltip > .usa-tooltip__body").should(
        "have.text",
        "Contract #1: African American Child and Family Research Center"
    );
    cy.get("tbody > :nth-child(1) > :nth-child(2) > .usa-tooltip > .usa-tooltip__trigger").should(
        "have.text",
        "Human Services Interoperability Support"
    );
    cy.get("tbody > :nth-child(1) > :nth-child(2) > .usa-tooltip > .usa-tooltip__body").should(
        "have.text",
        "Human Services Interoperability Support"
    );
    cy.get("tbody > :nth-child(1) > :nth-child(3)").should("have.text", "Contract");
    cy.get("tbody > :nth-child(1) > :nth-child(4)").should("have.text", "$2,000,000.00");
    cy.get("tbody > :nth-child(1) > :nth-child(5)").should("have.text", "$0");
    cy.get("tbody > :nth-child(1) > :nth-child(6)").should("have.text", "None");

    cy.get("tbody tr").first().trigger("mouseover");
    cy.get("button[id^='submit-for-approval-']").first().should("exist");
    cy.get("button[id^='submit-for-approval-']").first().should("not.be.disabled");

    // expand first row
    cy.get(':nth-child(1) > :nth-child(7) > [data-cy="expand-row"]').should("exist");
    cy.get(':nth-child(1) > :nth-child(7) > [data-cy="expand-row"]').click();
    cy.get(".padding-right-9 > :nth-child(1) > :nth-child(1)").should("have.text", "Created By");
    cy.get(".width-mobile > .text-base-dark").should("have.text", "Description");
    cy.get('[style="margin-left: 3.125rem;"] > .text-base-dark').should("have.text", "Budget Lines");
});

it("navigates to the ReviewAgreements page when the review button is clicked", () => {
    cy.get(".usa-table").should("exist");
    cy.get("tbody tr").first().trigger("mouseover");
    cy.get("button[id^='submit-for-approval-']").first().should("exist");
    cy.get("button[id^='submit-for-approval-']").first().should("not.be.disabled");
    cy.get("button[id^='submit-for-approval-']").first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    cy.url().should("include", "/agreements/review");
    cy.get("h1").should("exist");
    cy.get("h1").should("have.text", "Review and Send Agreement to Approval");
});

it("Agreements Table is correctly filtered on all-agreements or my-agreements", () => {
    cy.visit("/agreements?filter=all-agreements");
    cy.get("tbody").children().should("have.length.at.least", 1);

    cy.visit("/agreements?filter=my-agreements");
    cy.get("tbody").children().should("have.length.at.least", 1);
});

it("the filter button works as expected", () => {
    cy.visit("/agreements?filter=all-agreements");
    cy.get("button").contains("Filter").click();

    // set a number of filters
    cy.get("input[id='current-fy']").click({ force: true });

    // get select element by name "project-react-select"
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get(".project-combobox__control")
        .click()
        .get(".project-combobox__menu")
        .find(".project-combobox__option")
        .first()
        .click();
    // eslint-disable-next-line cypress/unsafe-to-chain-command
    cy.get(".project-officer-combobox__control")
        .click()
        .get(".project-officer-combobox__menu")
        .find(".project-officer-combobox__option")
        .first()
        .click();
    cy.get("#agreement_type").select("CONTRACT");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("label").contains("Planned").click({ force: true });
    cy.get("label").contains("Executing").click({ force: true });
    cy.get("label").contains("Obligated").click({ force: true });

    // click the button that has text Apply
    cy.get("button").contains("Apply").click();

    // check that the correct tags are displayed
    cy.get("div").contains("Upcoming Need By Date: Current FY").should("exist");
    cy.get("div").contains("Project: Human Services Interoperability Support").should("exist");
    cy.get("div").contains("Project Officer: Chris Fortunato").should("exist");
    cy.get("div").contains("Type: Contract").should("exist");
    cy.get("div").contains("Procurement Shop: Product Service Center").should("exist");
    cy.get("div").contains("Budget Line Status: Draft").should("exist");

    // check that the table is filtered correctly
    cy.get("div[id='agreements-table-zero-results']").should("exist");

    // reset
    cy.get("button").contains("Filter").click();
    cy.get("button").contains("Reset").click();
    cy.get("button").contains("Apply").click();

    // check that no tags are displayed
    cy.get("div").contains("Upcoming Need By Date: Current FY").should("not.exist");
    cy.get("div").contains("Project: Human Services Interoperability Support").should("not.exist");
    cy.get("div").contains("Project Officer: Chris Fortunato").should("not.exist");
    cy.get("div").contains("Type: Contract").should("not.exist");
    cy.get("div").contains("Procurement Shop: Product Service Center").should("not.exist");
    cy.get("div").contains("Budget Line Status: Draft").should("not.exist");

    // check that the table is filtered correctly
    cy.get("div[id='agreements-table-zero-results']").should("not.exist");
});

it("clicking the add agreement button takes you to the create agreement page", () => {
    cy.visit("/agreements?filter=all-agreements");
    cy.get("a").contains("Add Agreement").click();
    cy.url().should("include", "/agreements/create");
});

it("For Approval tab works using filter=for-approval", () => {
    const testAgreement = {
        agreement_type: "CONTRACT",
        agreement_reason: "NEW_REQ",
        name: "Test Contract",
        description: "Test Description",
        research_project_id: 1,
        product_service_code_id: 1,
        procurement_shop_id: 1,
        project_officer_id: 1,
        team_members: [
            {
                id: 21
            },
            {
                id: 5
            }
        ],
        notes: "Test Notes"
    };
    const testBli = {
        line_description: "SC1",
        comments: "",
        can_id: 1,
        agreement_id: 11,
        amount: 1000000,
        status: "UNDER_REVIEW",
        date_needed: "2025-1-01",
        proc_shop_fee_percentage: 0.005
    };
    expect(localStorage.getItem("access_token")).to.exist;

    let testAgreementId;
    let testBliId;

    // create test agreement
    const bearer_token = `Bearer ${window.localStorage.getItem("access_token")}`;
    cy.request({
        method: "POST",
        url: "http://localhost:8080/api/v1/agreements/",
        body: testAgreement,
        headers: {
            Authorization: bearer_token,
            "Content-Type": "application/json",
            Accept: "application/json"
        }
    })
        .then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.id).to.exist;
            const agreementId = response.body.id;
            return agreementId;
        })
        .then((agreementId) => {
            const bliData = { ...testBli, agreement_id: agreementId };
            cy.request({
                method: "POST",
                url: "http://localhost:8080/api/v1/budget-line-items/",
                body: bliData,
                headers: {
                    Authorization: bearer_token,
                    Accept: "application/json"
                }
            }).then((response) => {
                expect(response.status).to.eq(201);
                expect(response.body.id).to.exist;
                const bliId = response.body.id;
                return { agreementId, bliId };
            });
        })
        .then(({ agreementId, bliId }) => {
            cy.visit("/agreements?filter=for-approval");
            cy.get(":nth-child(1) > .margin-0").should("have.text", "For Approval");
            cy.get("tbody").children().should("have.length.at.least", 1);
            cy.get("tbody tr").first().trigger("mouseover");
            cy.get("[data-cy='go-to-approve-row']").first().should("exist");
            cy.get("[data-cy='go-to-approve-row']")
                .first()
                .should("not.be.disabled")
                .then(() => {
                    return { agreementId, bliId };
                });
        })
        .then(({ agreementId, bliId }) => {
            cy.request({
                method: "PATCH",
                url: `http://localhost:8080/api/v1/budget-line-items/${bliId}`,
                body: { status: "DRAFT" },
                headers: {
                    Authorization: bearer_token,
                    Accept: "application/json"
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                return agreementId;
            });
        })

        .then((agreementId) => {
            cy.request({
                method: "DELETE",
                url: `http://localhost:8080/api/v1/agreements/${agreementId}`,
                headers: {
                    Authorization: bearer_token,
                    Accept: "application/json"
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
            });
        })
        .then(({ agreementId, bliId }) => {
            cy.visit("/agreements?filter=for-approval");
            cy.get(":nth-child(1) > .margin-0").should("have.text", "For Approval");
        });
});
