import Accordion from "../../UI/Accordion";
import CurrencySummaryCard from "../../UI/CurrencySummaryCard/CurrencySummaryCard";
import CANFundingBar from "../../CANs/CANFundingBar/CANFundingBar";
import React from "react";
import { useGetAgreementByIdQuery, useGetCanFundingSummaryQuery } from "../../../api/opsAPI";
import { calculatePercent } from "../../../helpers/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import CurrencyFormat from "react-currency-format";
import Tag from "../../UI/Tag";

const CANFundingCard = ({ can, pendingAmount }) => {
    const canId = can.can_id;
    const { data: data, error: error, isLoading: isLoading } = useGetCanFundingSummaryQuery(canId);
    const [activeId, setActiveId] = React.useState(0);

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>An error occurred loading CAN funding data</div>;
    }

    const totalFunding = Number(data.total_funding);
    const availableFunding = Number(data.available_funding);
    const totalAccountedFor = totalFunding - availableFunding; // same as adding planned, obligated, in_execution
    const totalSpending = totalAccountedFor; // TODO: subtract off pending BLIs
    const remainingBudget = availableFunding; // TODO: subtract off pending BLIs

    // available_funding = float(total_funding) - float(total_accounted_for)

    const canFundingBarData = [
        {
            id: 1,
            label: "Total Spending",
            value: totalSpending,
            color: "#80A858",
            // tagStyle: "lightTextGreenBackground",
            tagStyle: "darkTextWhiteBackground",
            percent: `${calculatePercent(totalSpending, totalFunding)}%`
        },
        {
            id: 2,
            label: `Remaining Budget`,
            value: remainingBudget,
            color: "#A9AEB1",
            tagStyle: "darkTextWhiteBackground",
            percent: `${calculatePercent(remainingBudget, totalFunding)}%`
        }
    ];

    const LegendItem = ({ id, label, value, color, percent, tagStyle }) => {
        const isGraphActive = activeId === id;
        return (
            <div className="grid-row margin-top-2">
                <div className="grid-col-7">
                    <div className="display-flex flex-align-center">
                        <FontAwesomeIcon
                            icon={faCircle}
                            className={`height-1 width-1 margin-right-05`}
                            style={{ color: color }}
                        />

                        <span className={isGraphActive ? "fake-bold" : undefined}>{label}</span>
                    </div>
                </div>
                <div className="grid-col-4">
                    <CurrencyFormat
                        value={value}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$ "}
                        renderText={(value) => <span className={isGraphActive ? "fake-bold" : undefined}>{value}</span>}
                    />
                </div>
                <div className="grid-col-1">
                    <Tag
                        tagStyle={tagStyle}
                        text={percent}
                        label={label}
                        active={isGraphActive}
                    />
                </div>
            </div>
        );
    };

    return (
        <div>
            <CurrencySummaryCard
                headerText={"G99CC23 (5 Year) \n CAN Total Budget"}
                amount={totalFunding}
            >
                <div
                    id="currency-summary-card"
                    className="margin-top-2"
                >
                    <CANFundingBar
                        setActiveId={setActiveId}
                        data={canFundingBarData}
                    />
                </div>
                <div className="font-12px margin-top-2">
                    {canFundingBarData.map((item) => (
                        <LegendItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            value={item.value}
                            color={item.color}
                            percent={item.percent}
                            tagStyle={item.tagStyle}
                        />
                    ))}
                </div>
            </CurrencySummaryCard>
            <div style={{ marginTop: "30px" }}>{/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}</div>
        </div>
    );
};

const AgreementCANReviewAccordian = ({ agreement, selectedBudgetLines }) => {
    return (
        <Accordion
            heading="Review CANs"
            level={2}
        >
            <p>
                The budget lines showing In Review Status have allocated funds from the CANs displayed below. Use the
                toggle to see how your approval would change the remaining budget of CANs within your Portfolio or
                Division.
            </p>
            <CANFundingCard can={{ can_id: 1 }} />
            <CANFundingCard can={{ can_id: 2 }} />
            <CANFundingCard can={{ can_id: 3 }} />
            <CANFundingCard can={{ can_id: 4 }} />
            <CANFundingCard can={{ can_id: 5 }} />
            {/*<div>-----------</div>*/}
            {/*<pre>{JSON.stringify(selectedBudgetLines, null, 2)}</pre>*/}
        </Accordion>
    );
};

export default AgreementCANReviewAccordian;
