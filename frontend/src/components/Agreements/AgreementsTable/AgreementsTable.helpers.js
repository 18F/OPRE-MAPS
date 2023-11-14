import { draftBudgetLineStatuses, formatDate } from "../../../helpers/utils";
export { getAgreementSubTotal, getProcurementShopSubTotal } from "../../../helpers/agreement.helpers";

const handleAgreementProp = (agreement) => {
    if (typeof agreement !== "object") {
        throw new Error(`Agreement must be an object, but got ${typeof agreement}`);
    }
};

export const getAgreementName = (agreement) => {
    handleAgreementProp(agreement);
    return agreement.display_name;
};

export const getResearchProjectName = (agreement) => {
    handleAgreementProp(agreement);
    return agreement.research_project?.title;
};

export const getAgreementNotes = (agreement) => {
    handleAgreementProp(agreement);
    return agreement.notes;
};

export const findNextBudgetLine = (agreement) => {
    handleAgreementProp(agreement);
    const today = new Date();
    let nextBudgetLine;
    agreement.budget_line_items?.forEach((bli) => {
        if (!draftBudgetLineStatuses.includes(bli.status) && bli.date_needed && new Date(bli.date_needed) >= today) {
            if (!nextBudgetLine || bli.date_needed < nextBudgetLine.date_needed) {
                nextBudgetLine = bli;
            }
        }
    });
    return nextBudgetLine;
};

export const findNextNeedBy = (agreement) => {
    handleAgreementProp(agreement);
    const nextBudgetLine = findNextBudgetLine(agreement);
    let nextNeedBy = nextBudgetLine?.date_needed;
    nextNeedBy = nextNeedBy ? formatDate(new Date(nextNeedBy)) : "None";
    return nextNeedBy;
};

export const getAgreementCreatedDate = (agreement) => {
    handleAgreementProp(agreement);
    const formattedToday = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });

    return agreement?.created_on
        ? new Date(agreement.created_on).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : formattedToday;
};

export const getAgreementStatus = (agreement) => {
    handleAgreementProp(agreement);

    return agreement.budget_line_items?.find((bli) => bli.status === "UNDER_REVIEW") ? "In Review" : "Draft";
};

export const areAllBudgetLinesInStatus = (agreement, status) => {
    handleAgreementProp(agreement);

    return agreement.budget_line_items?.every((bli) => bli.status === status);
};

export const isThereAnyBudgetLines = (agreement) => {
    handleAgreementProp(agreement);

    return agreement?.budget_line_items?.length > 0;
};
