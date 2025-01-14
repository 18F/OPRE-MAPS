import Table from "../../UI/Table";
import CANFundingReceivedTableRow from "./CANFundingReceivedTableRow";

/**
 * @typedef {import("../../../components/CANs/CANTypes").FundingReceived} FundingReceived
 */

/**
 * @typedef {Object} CANFundingReceivedTableProps
 * @property {string} totalFunding
 * @property {FundingReceived[]} fundingReceived data for table
 * @property {boolean} isEditMode for if we're in edit mode
 * @property {(id: number) => void} handleEditFundingReceived function for editing funding received
 */

/**
 * @component - The CAN Funding component.
 * @param {CANFundingReceivedTableProps} props
 * @returns  {JSX.Element} - The component JSX.
 */
const CANFundingReceivedTable = ({ fundingReceived, totalFunding, isEditMode, handleEditFundingReceived }) => {
    return (
        <Table tableHeadings={["Funding ID", "FY", "Funding Received", "% of Total FY Budget", " "]}>
            {fundingReceived.map((fundingRow) => {
                return (
                    <CANFundingReceivedTableRow
                        key={fundingRow.id}
                        fundingReceived={fundingRow}
                        totalFunding={totalFunding}
                        isEditMode={isEditMode}
                        handleEditFundingReceived={handleEditFundingReceived}
                    />
                );
            })}
        </Table>
    );
};

export default CANFundingReceivedTable;
