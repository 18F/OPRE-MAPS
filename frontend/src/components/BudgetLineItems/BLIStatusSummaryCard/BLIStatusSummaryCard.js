import React from "react";
import CurrencyFormat from "react-currency-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { ResponsiveDonutWithInnerPercent } from "../../UI/ResponsiveDonutWithInnerPercent/ResponsiveDonutWithInnerPercent";
import CustomLayerComponent from "../../UI/ResponsiveDonutWithInnerPercent/CustomLayerComponent";
import Tag from "../../UI/Tag/Tag";
import RoundedBox from "../../UI/RoundedBox";
import { calculatePercent, totalBudgetLineFeeAmount } from "../../../helpers/utils";
import styles from "./styles.module.css";

const BLIStatusSummaryCard = ({ budgetLines }) => {
    const [percent, setPercent] = React.useState("");
    const [hoverId, setHoverId] = React.useState(-1);

    const budgetLinesTotalsByStatus = budgetLines.reduce((acc, budgetLine) => {
        const { status } = budgetLine;
        if (!acc[status]) {
            acc[status] = {
                total: 0,
                count: 0 // not used but handy for debugging
            };
        }
        acc[status].total +=
            budgetLine.amount + totalBudgetLineFeeAmount(budgetLine.amount, budgetLine.proc_shop_fee_percentage);
        acc[status].count += 1;
        return acc;
    }, {});

    console.log(budgetLinesTotalsByStatus);

    const totalFunding = Object.values(budgetLinesTotalsByStatus).reduce((acc, status) => {
        return acc + status.total;
    }, 0);

    console.log({ totalFunding });

    const data = [
        {
            id: 1,
            label: "Draft",
            value: budgetLinesTotalsByStatus.DRAFT?.total ?? 0,
            color: "#A9AEB1",
            percent: `${calculatePercent(budgetLinesTotalsByStatus.DRAFT?.total ?? 0, totalFunding)}%`
        },
        {
            id: 2,
            label: "Planned",
            value: budgetLinesTotalsByStatus.PLANNED?.total ?? 0,
            color: "#336A90",
            percent: `${calculatePercent(budgetLinesTotalsByStatus.PLANNED?.total ?? 0, totalFunding)}%`
        },
        {
            id: 3,
            label: "Executing",
            value: budgetLinesTotalsByStatus.IN_EXECUTION?.total ?? 0,
            color: "#E5A000",
            percent: `${calculatePercent(budgetLinesTotalsByStatus.IN_EXECUTION?.total ?? 0, totalFunding)}%`
        },
        {
            id: 4,
            label: "Obligated",
            value: budgetLinesTotalsByStatus.OBLIGATED?.total ?? 0,
            color: "#3A835B",
            percent: `${calculatePercent(budgetLinesTotalsByStatus.OBLIGATED?.total ?? 0, totalFunding)}%`
        }
    ];

    const LegendItem = ({ id, label, value, color, percent }) => {
        const isGraphActive = hoverId === id;
        return (
            <div className="grid-row margin-top-2">
                <div className="grid-col-5">
                    <div className="display-flex flex-align-center">
                        <FontAwesomeIcon
                            icon={faCircle}
                            className={`height-1 width-1 margin-right-05`}
                            style={{ color: color }}
                        />
                        <span className={isGraphActive ? "fake-bold" : ""}>{label}</span>
                    </div>
                </div>
                <div className="grid-col-6">
                    <CurrencyFormat
                        value={value}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$ "}
                        renderText={(value) => <span className={isGraphActive ? "fake-bold" : ""}>{value}</span>}
                    />
                </div>
                <div className="grid-col-1">
                    <Tag
                        tagStyle="darkTextWhiteBackground"
                        text={percent}
                        label={label}
                        active={isGraphActive}
                    />
                </div>
            </div>
        );
    };

    return (
        <RoundedBox
            className="padding-y-205 padding-x-4 display-inline-block"
            dataCy="bli-status-summary-card"
        >
            <h3 className="margin-0 margin-bottom-3 font-12px text-base-dark text-normal">Budget Lines By Status</h3>

            <div className="display-flex flex-justify">
                <div
                    className={
                        totalFunding > 0 ? `${styles.widthLegend} maxw-card-lg font-12px` : "width-card-lg font-12px"
                    }
                >
                    {data.map((item) => (
                        <LegendItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            value={item.value}
                            color={item.color}
                            percent={item.percent}
                        />
                    ))}
                </div>
                <div
                    id="budget-line-status-chart"
                    className="width-card height-card margin-top-neg-2"
                    aria-label="This is a Donut Chart that displays the percent by budget line status in the center."
                    role="img"
                >
                    <ResponsiveDonutWithInnerPercent
                        data={data}
                        width={175}
                        height={175}
                        margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                        setPercent={setPercent}
                        setHoverId={setHoverId}
                        CustomLayerComponent={CustomLayerComponent(percent)}
                        container_id="budget-line-status-chart"
                    />
                </div>
            </div>
        </RoundedBox>
    );
};

export default BLIStatusSummaryCard;
