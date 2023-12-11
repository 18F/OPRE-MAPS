import { useSelector } from "react-redux";

/**
 * @typedef {Object} BudgetLine
 * @property {number} id - The ID of the budget line.
 * @property {string} status - The status of the budget line.
 * @property {number} created_by - The ID of the user who created the budget line.
 */

/*
 * This hook returns true if the budget line is in a status that is editable.
 * @param {BudgetLine} budgetLine - The budget line object.
 * @returns {boolean} - Whether the budget line is in a status that is editable.
 * @example
 * const isBudgetLineInEditableStatus = useIsBudgetLineEditableByStatus(budgetLine);
 */
export const useIsBudgetLineEditableByStatus = (/** @type {BudgetLine} */ budgetLine) => {
    const isBudgetLineDraft = budgetLine?.status === "DRAFT";
    const isBudgetLineInReview = budgetLine?.status === "UNDER_REVIEW";
    const isBudgetLinePlanned = budgetLine?.status === "PLANNED";
    const isBudgetLineInEditableStatus = isBudgetLineDraft || isBudgetLineInReview || isBudgetLinePlanned;

    return isBudgetLineInEditableStatus;
};

/*
 * This hook returns true if the logged in user is the creator of the budget line.
 * @param {BudgetLine} budgetLine - The budget line object.
 * @returns {boolean} - Whether the logged in user is the creator of the budget line.
 * @example
 * const isUserBudgetLineCreator = useIsBudgetLineCreator(budgetLine);
 */
export const useIsBudgetLineCreator = (/** @type {BudgetLine} */ budgetLine) => {
    const loggedInUserId = useSelector((state) => state?.auth?.activeUser?.id);
    const isUserBudgetLineCreator = budgetLine?.created_by === loggedInUserId;

    return isUserBudgetLineCreator;
};
