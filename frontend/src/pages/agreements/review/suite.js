import { create, test, enforce, only, each } from "vest";

const suite = create((fieldName) => {
    only(fieldName);

    test("name", "This is required information", () => {
        enforce(fieldName.name).isNotBlank();
    });
    test("type", "This is required information", () => {
        enforce(fieldName.agreement_type).isNotBlank();
    });
    test("description", "This is required information", () => {
        enforce(fieldName.description).isNotBlank();
    });
    test("psc", "This is required information", () => {
        enforce(fieldName.product_service_code?.name).isNotBlank();
    });
    test("naics", "This is required information", () => {
        enforce(fieldName.product_service_code?.naics).isNotBlank();
    });
    test("program-support-code", "This is required information", () => {
        enforce(fieldName.product_service_code?.support_code).isNotBlank();
    });
    test("procurement-shop", "This is required information", () => {
        enforce(fieldName.procurement_shop?.abbr).isNotBlank();
    });
    test("reason", "This is required information", () => {
        enforce(fieldName.agreement_reason).isNotBlank();
    });
    // incumbent is not required
    test("project-officer", "This is required information", () => {
        enforce(fieldName.project_officer_id).isNotBlank();
    });
    // test to ensure at least one budget line item exists
    test("budget-line-items", "Must have at least one budget line item", () => {
        enforce(fieldName.budget_line_items).longerThan(0);
    });
    // test budget_line_items array
    each(fieldName.budget_line_items, (item) => {
        test(`Budget line item (${item.display_name})`, "This is required information", () => {
            // enforce(item.line_description).isNotBlank();
            enforce(item.date_needed).isNotBlank();
            enforce(item.can_id).isNotBlank();
            enforce(item.amount).greaterThan(0);
        });

        test(`Budget line item (${item.display_name})`, "Need by date must be in the future", () => {
            const today = new Date().valueOf();
            const dateNeeded = new Date(item.date_needed).valueOf();
            enforce(dateNeeded).greaterThan(today);
        });
    });
});

export default suite;
