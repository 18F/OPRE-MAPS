import PropTypes from "prop-types";
import TotalSummaryCard from "./TotalSummaryCard";
import Table from "../Table";
import TableRowExpandable from "../TableRowExpandable";
import "./BudgetLinesTable.scss";
import { BUDGET_LINE_TABLE_HEADERS } from "../../../constants";

/**
 * A table component that displays budget lines.
 * @param {Object} props - The component props.
 * @param {Array<any>} [props.budgetLinesAdded] - An array of budget lines to display. - optional
 * @param {Boolean} [props.canUserEditBudgetLines] - A flag to indicate if the user is agreement owner, project officer, on the agreement team, or creator of any of the BLIs on the agreement. - optional
 * @param {Function} [props.handleSetBudgetLineForEditing ]- A function to handle editing a budget line. - optional
 * @param {Function} [props.handleDeleteBudgetLine] - A function to handle deleting a budget line. - optional
 * @param {Function} [props.handleDuplicateBudgetLine] - A function to handle duplicating a budget line. - optional
 * @param {Boolean} [props.readOnly] - A flag to indicate if the table is read-only.
 * @param {Boolean} [props.isReviewMode] - A flag to indicate if the table is in review mode.
 * @returns {JSX.Element} - The rendered table component.
 */
const BudgetLinesTable = ({
    budgetLinesAdded = [],
    canUserEditBudgetLines = false,
    handleSetBudgetLineForEditing = () => {},
    handleDeleteBudgetLine = () => {},
    handleDuplicateBudgetLine = () => {},
    readOnly = false,
    isReviewMode = false,
}) => {
    const sortedBudgetLines = budgetLinesAdded
        .slice()
        .sort((a, b) => Date.parse(a.created_on) - Date.parse(b.created_on))
        .reverse();

    return (
        <>
            <Table tableHeadings={BUDGET_LINE_TABLE_HEADERS}>
                {sortedBudgetLines.map((bl) => (
                    <TableRowExpandable
                        key={bl?.id}
                        bl={bl}
                        canUserEditBudgetLines={canUserEditBudgetLines}
                        handleDeleteBudgetLine={handleDeleteBudgetLine}
                        handleDuplicateBudgetLine={handleDuplicateBudgetLine}
                        handleSetBudgetLineForEditing={handleSetBudgetLineForEditing}
                        isReviewMode={isReviewMode}
                        readOnly={readOnly}
                    />
                ))}
            </Table>
            <TotalSummaryCard budgetLines={sortedBudgetLines}></TotalSummaryCard>
        </>
    );
};

BudgetLinesTable.propTypes = {
    budgetLinesAdded: PropTypes.arrayOf(PropTypes.object),
    canUserEditBudgetLines: PropTypes.bool,
    handleSetBudgetLineForEditing: PropTypes.func,
    handleDeleteBudgetLine: PropTypes.func,
    handleDuplicateBudgetLine: PropTypes.func,
    readOnly: PropTypes.bool,
    errors: PropTypes.arrayOf(PropTypes.array),
    isReviewMode: PropTypes.bool,
};

export default BudgetLinesTable;
