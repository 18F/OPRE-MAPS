/// <reference types="cypress" />

import { terminalLog, testLogin } from "./utils";

beforeEach(() => {
    testLogin("admin");
    cy.visit("/agreements/create");
});

afterEach(() => {
    cy.injectAxe();
    cy.checkA11y(null, null, terminalLog);
});

it("loads", () => {
    cy.get("h2").should("contain", "Select a Project");
});

it("project type select has some projects", () => {
    cy.get("#project-combobox-input").type("{downarrow}");
    // .project-combobox__menu-list
    cy.get(".project-combobox__option").should("contain", "Human Services Interoperability Support");
    cy.get(".project-combobox__option").should("contain", "Youth Demonstration Development Project");
    cy.get(".project-combobox__option").should("contain", "Annual Performance Plans and Reports");
    cy.get("#project-combobox-input").type("{esc}");
});

it("can create an SEVERABLE agreement", () => {
    cy.intercept("POST", "**/agreements").as("postAgreement");

    // Step One - Select a Project
    cy.get("#project-combobox-input").type("Human Services Interoperability Support{enter}");
    cy.get("#continue").click();

    // Step Two - Create an Agreement
    // test for rendered ProjectSummaryCard
    cy.get("dt").should("contain", "Project");
    cy.get("dd").should("contain", "Human Services Interoperability Support");
    // test validation for Agreement Type
    cy.get("#agreement_type").select("CONTRACT");
    cy.get("#agreement_type").select(0);
    cy.get(".usa-error-message").should("exist");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // fix Agreement Type
    cy.get("#agreement_type").select("CONTRACT");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // Test validation for Agreement Title
    cy.get("#name").type("Test Agreement Title");
    cy.get("#name").clear();
    cy.get("#name").blur();
    cy.get(".usa-error-message").should("contain", "This is required information");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // fix Agreement Title
    cy.get("#name").type("Test Agreement Title");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("not.be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("not.be.disabled");
    // complete contract type and service req type
    cy.get("#contractType").select("FIRM_FIXED_PRICE");
    // test default should be NON-SEVERABLE
    cy.get("#serviceReqType").should("contain", "Non-Severable");
    cy.get("#serviceReqType").select("Select Service Requirement Type");
    cy.get(".usa-error-message").should("contain", "This is required information");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // change to SEVERABLE
    cy.get("#serviceReqType").select("SEVERABLE");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("not.be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("not.be.disabled");
    // complete the rest of the form
    cy.get("#description").type("Test Agreement Description");
    cy.get("#product_service_code_id").select("Other Scientific and Technical Consulting Services");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("#agreement_reason").select("NEW_REQ");

    // Select Project Officer
    cy.get("#project-officer-combobox-input").type("Chris Fortunato{enter}");

    // Add Team Members
    cy.get(".team-member-combobox__input").type("Amy Madigan{enter}");
    cy.get(".team-member-combobox__input").type("Tia Brown{enter}");

    cy.get("#agreementNotes").type("This is a note.");
    cy.get("[data-cy='continue-btn']").click();
    //  Add Services Component
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    // test form submission with no services component
    cy.get("[data-cy='add-services-component-btn']").click();
    // browser should generate error message
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    cy.get("#servicesComponentSelect").select("1");
    cy.get("#servicesComponentSelect").select("");
    cy.get("[data-cy='add-services-component-btn']").click();
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    cy.get("#servicesComponentSelect").select("1");
    cy.get("#popStartMonth").select("01 - Jan");
    cy.get("#popStartDay").type("1");
    cy.get("#popStartYear").type("2024");
    cy.get("#popEndMonth").select("01 - Jan");
    cy.get("#popEndDay").type("1");
    cy.get("#popEndYear").type("2025");
    cy.get("#description").type("This is a description.");
    cy.get("[data-cy='add-services-component-btn']").click();
    cy.get("h2").should("contain", "Base Period 1");

    // Add a new budget line item
    cy.get("#allServicesComponentSelect").should("exist");
    cy.get("#allServicesComponentSelect").select("Base Period 1");
    cy.get("#enteredMonth").select("01 - Jan");
    cy.get("#enteredDay").type("1");
    cy.get("#enteredYear").type("2024");
    cy.get("#selectedCan").type("G99MVT3{enter}");
    cy.get("#enteredAmount").type("1000000");
    cy.get("#enteredComments").type("Something something note something.");
    cy.get("#add-budget-line").click();

    // Duplicate budget line item
    cy.get("[id^=expand-]").click();
    cy.get("[id^=duplicate-]").click();

    // expand budget line and check that the "created by" name is not empty.
    cy.get("[id^=expand-]").each((_, element) => {
        const item = Cypress.$(element);
        const id = item.attr("id");
        if (id !== undefined) {
            const index = id.split("-")[1];
            item.click();

            cy.get(`#created-by-name-${index}`, { timeout: 15000 })
                .invoke("text")
                .then((text) => {
                    expect(text.length).to.be.at.least(1);
                });
        }
    });
    const bearer_token = `Bearer ${window.localStorage.getItem("access_token")}`;
    cy.wait("@postAgreement").then((interception) => {
        const { statusCode, body } = interception.response;
        expect(statusCode).to.equal(201);
        expect(body.message).to.equal("Agreement created");
        const agreementId = body.id;

        cy.get("h1").should("exist");
        // delete test agreement
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
    });
});

it("can create an NON-SEVERABLE agreement", () => {
    cy.intercept("POST", "**/agreements").as("postAgreement");

    // Step One - Select a Project
    cy.get("#project-combobox-input").type("Human Services Interoperability Support{enter}");
    cy.get("#continue").click();

    // Step Two - Create an Agreement
    // test for rendered ProjectSummaryCard
    cy.get("dt").should("contain", "Project");
    cy.get("dd").should("contain", "Human Services Interoperability Support");
    // test validation for Agreement Type
    cy.get("#agreement_type").select("CONTRACT");
    cy.get("#agreement_type").select(0);
    cy.get(".usa-error-message").should("exist");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // fix Agreement Type
    cy.get("#agreement_type").select("CONTRACT");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // Test validation for Agreement Title
    cy.get("#name").type("Test Agreement Title");
    cy.get("#name").clear();
    cy.get("#name").blur();
    cy.get(".usa-error-message").should("contain", "This is required information");
    cy.get("[data-cy='continue-btn']").should("be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("be.disabled");
    // fix Agreement Title
    cy.get("#name").type("Test Agreement Title");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("not.be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("not.be.disabled");
    // complete contract type and service req type
    cy.get("#contractType").select("FIRM_FIXED_PRICE");
    // test default should be NON-SEVERABLE
    cy.get("#serviceReqType").should("contain", "Non-Severable");
    cy.get(".usa-error-message").should("not.exist");
    cy.get("[data-cy='continue-btn']").should("not.be.disabled");
    cy.get("[data-cy='save-draft-btn']").should("not.be.disabled");
    // complete the rest of the form
    cy.get("#description").type("Test Agreement Description");
    cy.get("#product_service_code_id").select("Other Scientific and Technical Consulting Services");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("#agreement_reason").select("NEW_REQ");

    // Select Project Officer
    cy.get("#project-officer-combobox-input").type("Chris Fortunato{enter}");

    // Add Team Members
    cy.get(".team-member-combobox__input").type("Amy Madigan{enter}");
    cy.get(".team-member-combobox__input").type("Tia Brown{enter}");

    cy.get("#agreementNotes").type("This is a note.");
    cy.get("[data-cy='continue-btn']").click();
    //  Add Services Component
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    cy.get("#optional-services-component").should("be.disabled");
    // test form submission with no services component
    cy.get("[data-cy='add-services-component-btn']").click();
    // browser should generate error message
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    cy.get("#servicesComponentSelect").select("1");
    cy.get("#optional-services-component").should("be.disabled");
    cy.get("#servicesComponentSelect").select("");
    cy.get("[data-cy='add-services-component-btn']").click();
    cy.get("p").should("contain", "You have not added any Services Component yet.");
    cy.get("#servicesComponentSelect").select("2");
    cy.get("#optional-services-component").should("not.be.disabled");
    cy.get("#servicesComponentSelect").select("1");
    cy.get("#popStartMonth").select("01 - Jan");
    cy.get("#popStartDay").type("1");
    cy.get("#popStartYear").type("2024");
    cy.get("#popEndMonth").select("01 - Jan");
    cy.get("#popEndDay").type("1");
    cy.get("#popEndYear").type("2025");
    cy.get("#description").type("This is a description.");
    cy.get("[data-cy='add-services-component-btn']").click();
    cy.get("h2").should("contain", "Services Component 1");
    //create a new optional services component
    cy.get("#servicesComponentSelect").select("2");
    cy.get(".usa-checkbox").click();
    cy.get("#popStartMonth").select("01 - Jan");
    cy.get("#popStartDay").type("1");
    cy.get("#popStartYear").type("2024");
    cy.get("#popEndMonth").select("01 - Jan");
    cy.get("#popEndDay").type("1");
    cy.get("#popEndYear").type("2025");
    cy.get("#description").type("This is a description.");
    cy.get("[data-cy='add-services-component-btn']").click();
    cy.get("h2").should("contain", "Optional Services Component 2");

    //test that services component select SC1 or SC2 options should be disabled
    cy.get("#servicesComponentSelect").within(() => {
        cy.get("option:disabled").should("contain", "SC1");
        cy.get("option:disabled").should("contain", "SC2");
    });

    // Add a new budget line item
    cy.get("#allServicesComponentSelect").should("exist");
    // select should contain Services Component 1 and Optional Services Component 2
    cy.get("#allServicesComponentSelect").within(() => {
        cy.get("option").should("contain", "SC1");
        cy.get("option").should("contain", "OSC2");
    });
    cy.get("#allServicesComponentSelect").select("SC1");
    cy.get("#enteredMonth").select("01 - Jan");
    cy.get("#enteredDay").type("1");
    cy.get("#enteredYear").type("2024");
    cy.get("#selectedCan").type("G99MVT3{enter}");
    cy.get("#enteredAmount").type("1000000");
    cy.get("#enteredComments").type("Something something note something.");
    cy.get("#add-budget-line").click();
    cy.get("#allServicesComponentSelect").select("SC1");
    cy.get("#enteredMonth").select("01 - Jan");
    cy.get("#enteredDay").type("1");
    cy.get("#enteredYear").type("2025");
    cy.get("#selectedCan").type("G99MVT3{enter}");
    cy.get("#enteredAmount").type("2000000");
    cy.get("#enteredComments").type("Something something note something.");
    cy.get("#add-budget-line").click();
    // Services Component 1 Accordion should contain 2 budget lines
    cy.get("h3").should("contain", "Services Component 1").as("sc1");
    cy.get("@sc1").next().find(".usa-table").should("exist");
    // sc1 table should contain 2 rows
    cy.get("@sc1").next().find(".usa-table").find("tbody").find("tr").should("have.length", 2);
    cy.get("#allServicesComponentSelect").select("OSC2");
    cy.get("#enteredMonth").select("01 - Jan");
    cy.get("#enteredDay").type("1");
    cy.get("#enteredYear").type("2026");
    cy.get("#selectedCan").type("G99MVT3{enter}");
    cy.get("#enteredAmount").type("3000000");
    cy.get("#enteredComments").type("Something something note something.");
    cy.get("#add-budget-line").click();
    cy.get("h3").should("contain", "Optional Services Component 2").as("osc2");
    // get table in Optional Services Component 2
    cy.get("@osc2").next().find(".usa-table").should("exist");
    // osc2 table  should contain 1 row
    // TODO: try and discern between tables
    cy.get("@osc2").next().find(".usa-table").find("tbody").find("tr").should("have.length", 3);

    // expand budget line and check that the "created by" name is not empty.
    cy.get("[id^=expand-]").each((_, element) => {
        const item = Cypress.$(element);
        const id = item.attr("id");
        if (id !== undefined) {
            const index = id.split("-")[1];
            item.click();

            cy.get(`#created-by-name-${index}`, { timeout: 15000 })
                .invoke("text")
                .then((text) => {
                    expect(text.length).to.be.at.least(1);
                });
        }
    });
    const bearer_token = `Bearer ${window.localStorage.getItem("access_token")}`;
    cy.wait("@postAgreement").then((interception) => {
        const { statusCode, body } = interception.response;
        expect(statusCode).to.equal(201);
        expect(body.message).to.equal("Agreement created");
        const agreementId = body.id;

        cy.get("h1").should("exist");
        // delete test agreement
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
    });
});

it("should handle cancelling out of workflow on step 1", () => {
    cy.get("#project-combobox-input").type("Human Services Interoperability Support{enter}");
    // cancel out of workflow
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="confirm-action"]').click();
    // check that we are back on the home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get("h1").should("exist");
});

it("should handle cancelling out of workflow on step 2", () => {
    // Step One - Select a Project
    cy.get("#project-combobox-input").type("Human Services Interoperability Support{enter}");
    cy.get("#continue").click();
    // Step Two - Create an Agreement
    cy.get("dt").should("contain", "Project");
    cy.get("dd").should("contain", "Human Services Interoperability Support");
    cy.get("#agreement_type").select("CONTRACT");
    cy.get("#name").type("Test Agreement Title");
    cy.get("#description").type("Test Agreement Description");
    cy.get("#product_service_code_id").select("Other Scientific and Technical Consulting Services");
    cy.get("#procurement-shop-select").select("Product Service Center (PSC)");
    cy.get("#agreement_reason").select("NEW_REQ");
    // cancel out of workflow
    cy.get('[data-cy="cancel-button"]').click();
    cy.get('[data-cy="confirm-action"]').click();
    // check that we are back on the agreements page
    cy.url().should("eq", Cypress.config().baseUrl + "/agreements");
    cy.get("h1").should("exist");
});

// TODO: Add test for cancelling out of workflow on step 3
