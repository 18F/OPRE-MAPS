import PropTypes from "prop-types";
import Table from "../../UI/Table";
import BLIRow from "./BLIRow";
import { BUDGET_LINE_TABLE_HEADERS } from "./BudgetLinesTable.constants";
import "./BudgetLinesTable.scss";

/**
 * A table component that displays budget lines.
 * @param {Object} props - The component props.
 * @param {Array<any>} [props.budgetLines] - An array of budget lines to display. - optional
 * @param {Function} [props.handleSetBudgetLineForEditing ]- A function to handle editing a budget line. - optional
 * @param {Function} [props.handleDeleteBudgetLine] - A function to handle deleting a budget line. - optional
 * @param {Function} [props.handleDuplicateBudgetLine] - A function to handle duplicating a budget line. - optional
 * @param {Boolean} [props.readOnly] - A flag to indicate if the table is read-only.
 * @param {Boolean} [props.isReviewMode] - A flag to indicate if the table is in review mode.
 * @param {Array<number>} [props.workflowBudgetLineItemIds] - An array of budget line item ids that are in the current workflow. - optional
 * @returns {JSX.Element} - The rendered table component.
 */
const BudgetLinesTable = ({
    budgetLines = [],
    handleSetBudgetLineForEditing = () => {},
    handleDuplicateBudgetLine = () => {},
    readOnly = false,
    isReviewMode = false,
    workflowBudgetLineItemIds = []
}) => {
    const sortedBudgetLines = budgetLines
        .slice()
        .sort((a, b) => Date.parse(a.created_on) - Date.parse(b.created_on))
        .reverse();

    return (
        <>
            <Table tableHeadings={BUDGET_LINE_TABLE_HEADERS}>
                {sortedBudgetLines.map((budgetLine) => (
                    <BLIRow
                        key={budgetLine.id}
                        budgetLine={budgetLine}
                        handleDeleteBudgetLine={() => alert("not yet implemented")}
                        handleDuplicateBudgetLine={handleDuplicateBudgetLine}
                        handleSetBudgetLineForEditing={handleSetBudgetLineForEditing}
                        isReviewMode={isReviewMode}
                        readOnly={readOnly}
                        isBLIInCurrentWorkflow={
                            workflowBudgetLineItemIds && workflowBudgetLineItemIds.includes(budgetLine.id)
                        }
                    />
                ))}
            </Table>
        </>
    );
};

BudgetLinesTable.propTypes = {
    budgetLines: PropTypes.arrayOf(PropTypes.object),
    canUserEditBudgetLines: PropTypes.bool,
    handleSetBudgetLineForEditing: PropTypes.func,
    handleDeleteBudgetLine: PropTypes.func,
    handleDuplicateBudgetLine: PropTypes.func,
    readOnly: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.array),
    isReviewMode: PropTypes.bool,
    workflowBudgetLineItemIds: PropTypes.arrayOf(PropTypes.number)
};

export default BudgetLinesTable;
