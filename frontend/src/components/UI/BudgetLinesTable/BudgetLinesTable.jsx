import { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import CurrencyFormat from "react-currency-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faClock, faClone } from "@fortawesome/free-regular-svg-icons";
import TotalSummaryCard from "./TotalSummaryCard";
import { loggedInName, fiscalYearFromDate, formatDateNeeded } from "../../../helpers/utils";
import TableTag from "./TableTag";
import "./BudgetLinesTable.scss";

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

    let loggedInUser = useSelector((state) => loggedInName(state.auth?.activeUser));
    const loggedInUserId = useSelector((state) => state?.auth?.activeUser?.id);

    const TableRow = ({ bl }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [isRowActive, setIsRowActive] = useState(false);

        const formatted_today = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
        const bl_created_on = bl?.created_on
            ? new Date(bl.created_on).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : formatted_today;

        let feeTotal = bl?.amount * bl?.psc_fee_amount;
        let total = bl?.amount + feeTotal;
        const isBudgetLineDraft = bl?.status === "DRAFT";
        const isBudgetLineInReview = bl?.status === "UNDER_REVIEW";
        const isBudgetLinePlanned = bl?.status === "PLANNED";
        const isUserBudgetLineCreator = bl?.created_by === loggedInUserId;
        const isBudgetLineEditable =
            (canUserEditBudgetLines || isUserBudgetLineCreator) &&
            (isBudgetLineDraft || isBudgetLineInReview || isBudgetLinePlanned);

        const handleExpandRow = () => {
            setIsExpanded(!isExpanded);
            setIsRowActive(true);
        };

        // styles for the table row
        const removeBorderBottomIfExpanded = isExpanded ? "border-bottom-none" : undefined;
        const changeBgColorIfExpanded = { backgroundColor: isRowActive && "#F0F0F0" };

        const addErrorClassIfNotFound = (item) => {
            if (isReviewMode && !item) {
                return "table-item-error";
            } else {
                return undefined;
            }
        };
        // error class for need_by_date to be in the future
        const futureDateErrorClass = (item) => {
            const today = new Date().valueOf();
            const dateNeeded = new Date(item).valueOf();

            if (isReviewMode && dateNeeded < today) {
                return "table-item-error";
            } else {
                return undefined;
            }
        };

        const ChangeIcons = ({ budgetLine }) => {
            return (
                <>
                    {isBudgetLineEditable && (
                        <>
                            <FontAwesomeIcon
                                id={`edit-${bl?.id}`}
                                data-cy="edit-row"
                                icon={faPen}
                                className="text-primary height-2 width-2 margin-right-1 cursor-pointer usa-tooltip"
                                title="edit"
                                data-position="top"
                                onClick={() => handleSetBudgetLineForEditing(budgetLine)}
                            />
                            <FontAwesomeIcon
                                id={`delete-${bl?.id}`}
                                data-cy="delete-row"
                                data-testid="delete-row"
                                icon={faTrash}
                                title="delete"
                                data-position="top"
                                className="text-primary height-2 width-2 margin-right-1 cursor-pointer usa-tooltip"
                                onClick={() => handleDeleteBudgetLine(budgetLine.id)}
                            />
                        </>
                    )}
                    <FontAwesomeIcon
                        id={`duplicate-${bl?.id}`}
                        data-cy="duplicate-row"
                        icon={faClone}
                        title="duplicate"
                        data-position="top"
                        className={`text-primary height-2 width-2 cursor-pointer usa-tooltip ${
                            isBudgetLineEditable ? "margin-left-0" : "margin-left-6"
                        }`}
                        onClick={() => handleDuplicateBudgetLine(budgetLine)}
                    />
                </>
            );
        };
        return (
            <Fragment key={bl?.id}>
                <tr onMouseEnter={() => setIsRowActive(true)} onMouseLeave={() => !isExpanded && setIsRowActive(false)}>
                    <th
                        scope="row"
                        className={`${addErrorClassIfNotFound(bl?.line_description)} ${removeBorderBottomIfExpanded}`}
                        style={changeBgColorIfExpanded}
                    >
                        {bl?.line_description}
                    </th>
                    <td
                        className={`${futureDateErrorClass(
                            formatDateNeeded(bl?.date_needed)
                        )} ${addErrorClassIfNotFound(
                            formatDateNeeded(bl?.date_needed)
                        )} ${removeBorderBottomIfExpanded}`}
                        style={changeBgColorIfExpanded}
                    >
                        {formatDateNeeded(bl?.date_needed)}
                    </td>
                    <td
                        className={`${addErrorClassIfNotFound(
                            fiscalYearFromDate(bl?.date_needed)
                        )} ${removeBorderBottomIfExpanded}`}
                        style={changeBgColorIfExpanded}
                    >
                        {fiscalYearFromDate(bl?.date_needed)}
                    </td>
                    <td
                        className={`${addErrorClassIfNotFound(bl?.can?.number)} ${removeBorderBottomIfExpanded}`}
                        style={changeBgColorIfExpanded}
                    >
                        {bl?.can?.number}
                    </td>
                    <td
                        className={`${addErrorClassIfNotFound(bl?.amount)} ${removeBorderBottomIfExpanded}`}
                        style={changeBgColorIfExpanded}
                    >
                        <CurrencyFormat
                            value={bl?.amount || 0}
                            displayType={"text"}
                            thousandSeparator={true}
                            prefix={"$"}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            renderText={(value) => value}
                        />
                    </td>
                    <td className={removeBorderBottomIfExpanded} style={changeBgColorIfExpanded}>
                        {feeTotal === 0 ? (
                            0
                        ) : (
                            <CurrencyFormat
                                value={feeTotal}
                                displayType={"text"}
                                thousandSeparator={true}
                                prefix={"$"}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                renderText={(value) => value}
                            />
                        )}
                    </td>
                    <td className={removeBorderBottomIfExpanded} style={changeBgColorIfExpanded}>
                        {total === 0 ? (
                            0
                        ) : (
                            <CurrencyFormat
                                value={total}
                                displayType={"text"}
                                thousandSeparator={true}
                                prefix={"$"}
                                decimalScale={2}
                                fixedDecimalScale={true}
                                renderText={(value) => value}
                            />
                        )}
                    </td>
                    <td className={removeBorderBottomIfExpanded} style={changeBgColorIfExpanded}>
                        {isRowActive && !isExpanded && !readOnly ? (
                            <div>
                                <ChangeIcons budgetLine={bl} />
                            </div>
                        ) : (
                            <TableTag status={bl.status} />
                        )}
                    </td>
                    <td className={removeBorderBottomIfExpanded} style={changeBgColorIfExpanded}>
                        <FontAwesomeIcon
                            id={`expand-${bl?.id}`}
                            data-cy="expand-row"
                            icon={isExpanded ? faChevronUp : faChevronDown}
                            className="height-2 width-2 padding-right-1 hover: cursor-pointer"
                            onClick={() => handleExpandRow()}
                        />
                    </td>
                </tr>

                {isExpanded && (
                    <tr>
                        <td colSpan={9} className="border-top-none" style={{ backgroundColor: "#F0F0F0" }}>
                            <div className="display-flex padding-right-9">
                                <dl className="font-12px">
                                    <dt className="margin-0 text-base-dark">Created By</dt>
                                    <dd id={`created-by-name-${bl?.id}`} className="margin-0">
                                        {loggedInUser}
                                    </dd>
                                    <dt className="margin-0 text-base-dark display-flex flex-align-center margin-top-2">
                                        <FontAwesomeIcon icon={faClock} className="height-2 width-2 margin-right-1" />
                                        {bl_created_on}
                                    </dt>
                                </dl>
                                <dl className="font-12px" style={{ marginLeft: "9.0625rem" }}>
                                    <dt className="margin-0 text-base-dark">Notes</dt>
                                    <dd className="margin-0" style={{ maxWidth: "400px" }}>
                                        {bl?.comments ? bl.comments : "No notes added."}
                                    </dd>
                                </dl>
                                <div className="flex-align-self-end margin-left-auto margin-bottom-1">
                                    {!readOnly && <ChangeIcons budgetLine={bl} />}
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </Fragment>
        );
    };

    return (
        <>
            <table className="usa-table usa-table--borderless width-full">
                <thead>
                    <tr>
                        <th scope="col">Description</th>
                        <th scope="col">Need By</th>
                        <th scope="col">FY</th>
                        <th scope="col">CAN</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Fee</th>
                        <th scope="col">Total</th>
                        <th scope="col" className="padding-0" style={{ width: "6.25rem" }}>
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedBudgetLines.map((bl) => (
                        <TableRow key={bl?.id} bl={bl} />
                    ))}
                </tbody>
            </table>
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
