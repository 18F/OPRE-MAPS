import { faClock } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CurrencyFormat from "react-currency-format";
import { calculatePercent, formatDateToMonthDayYear } from "../../../helpers/utils";
import {
    changeBgColorIfExpanded,
    expandedRowBGColor,
    removeBorderBottomIfExpanded
} from "../../UI/TableRowExpandable/TableRowExpandable.helpers";
import { useTableRow } from "../../UI/TableRowExpandable/TableRowExpandable.hooks";
import { NO_DATA } from "../../../constants";
import TableRowExpandable from "../../UI/TableRowExpandable";
import ChangeIcons from "../../BudgetLineItems/ChangeIcons";

/**
 * @typedef {import("../../../components/CANs/CANTypes").FundingReceived} FundingReceived
 */

/**
 * @typedef {Object} CANFundingReceivedTableRowProps
 * @property {string} totalFunding
 * @property {FundingReceived} fundingReceived data for table
 * @property {boolean} isEditMode for if we're in edit mode
 * @property {(id: number) => void} populateFundingReceivedForm function for editing funding received
 */

/**
 * @component - The CAN Funding component.
 * @param {CANFundingReceivedTableRowProps} props
 * @returns  {JSX.Element} - The component JSX.
 */

const CANFundingReceivedTableRow = ({ fundingReceived, totalFunding, isEditMode, populateFundingReceivedForm }) => {
    const { isRowActive, isExpanded, setIsExpanded, setIsRowActive } = useTableRow();
    const borderExpandedStyles = removeBorderBottomIfExpanded(isExpanded);
    const bgExpandedStyles = changeBgColorIfExpanded(isExpanded);

    /**
     * Component for displaying funding received data in a table format
     * @component ExpandedData - Displays additional details when a row is expanded
     * @param {Object} props
     * @param {string} props.createdBy - Name of user who created the funding entry
     * @param {string} props.createdOn - Date when funding entry was created
     * @param {string} [props.notes] - Additional notes for the funding entry
     * @returns {JSX.Element} Table cell containing expanded details
     */
    const ExpandedData = ({ createdBy, createdOn, notes }) => (
        <td
            colSpan={9}
            className="border-top-none"
            style={expandedRowBGColor}
        >
            <div className="display-flex padding-right-9">
                <dl className="font-12px">
                    <dt className="margin-0 text-base-dark">Created By</dt>
                    <dd
                        id={`created-by-name`}
                        className="margin-0"
                    >
                        {createdBy ?? NO_DATA}
                    </dd>
                    <dt className="margin-0 text-base-dark display-flex flex-align-center margin-top-2">
                        <FontAwesomeIcon
                            icon={faClock}
                            className="height-2 width-2 margin-right-1"
                        />
                        {formatDateToMonthDayYear(createdOn)}
                    </dt>
                </dl>
                <dl
                    className="font-12px"
                    style={{ marginLeft: "9.0625rem" }}
                >
                    <dt className="margin-0 text-base-dark">Notes</dt>
                    <dd
                        className="margin-0"
                        style={{ maxWidth: "400px" }}
                    >
                        {notes ?? "No notes added."}
                    </dd>
                </dl>
            </div>
        </td>
    );

    /**
     * @component TableRowData component renders a table row
     * @param {Object} props - The properties object.
     * @param {number} props.rowId - The label of the row.
     * @param {number} props.fiscalYear - The fiscal year for the funding data.
     * @param {number} [props.funding] - The amount of funding received.
     * @param {string} [props.tempId] - The temp ID of unsaved funding received.
     * @param {number} props.totalFunding - The total funding available.
     * @returns {JSX.Element} The rendered table row data.
     */
    const TableRowData = ({ rowId, fiscalYear, funding = 0, totalFunding, tempId }) => (
        <>
            <th
                scope="row"
                className={`${borderExpandedStyles}`}
                style={bgExpandedStyles}
            >
                {rowId}
            </th>
            <td
                className={borderExpandedStyles}
                style={bgExpandedStyles}
            >
                {fiscalYear}
            </td>
            <td
                className={borderExpandedStyles}
                style={bgExpandedStyles}
            >
                <CurrencyFormat
                    value={funding}
                    displayType={"text"}
                    thousandSeparator={true}
                    prefix={"$"}
                    decimalScale={2}
                    fixedDecimalScale
                />
            </td>
            <td
                className={borderExpandedStyles}
                style={bgExpandedStyles}
            >
                {calculatePercent(funding, totalFunding)}%
            </td>
            {isRowActive && isEditMode ? (
                <td
                    className={borderExpandedStyles}
                    style={bgExpandedStyles}
                >
                    <ChangeIcons
                        handleDeleteItem={() => {}}
                        handleSetItemForEditing={() => {
                            const tempRowId = rowId.toString() === NO_DATA ? tempId : rowId;
                            populateFundingReceivedForm(tempRowId);
                        }}
                        isItemEditable={true}
                        isItemDeletable={true}
                        duplicateIcon={false}
                    />
                </td>
            ) : (
                <td width="113px"></td> // empty cell to maintain alignment
            )}
        </>
    );
    return (
        <TableRowExpandable
            tableRowData={
                <TableRowData
                    rowId={fundingReceived.id}
                    tempId={fundingReceived.tempId}
                    fiscalYear={fundingReceived.fiscal_year}
                    funding={fundingReceived.funding}
                    totalFunding={+totalFunding}
                />
            }
            expandedData={
                <ExpandedData
                    createdBy={fundingReceived.created_by_user?.full_name}
                    createdOn={fundingReceived.created_on}
                    notes={fundingReceived.notes}
                />
            }
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setIsRowActive={setIsRowActive}
        />
    );
};

export default CANFundingReceivedTableRow;
