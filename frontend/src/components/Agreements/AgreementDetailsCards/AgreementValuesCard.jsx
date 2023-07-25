import CurrencySummaryCard from "../../UI/CurrencySummaryCard/CurrencySummaryCard";
import styles from "./AgreementValuesCard.scss";
import {calculatePercent, fiscalYearFromDate} from "../../../helpers/utils";
import React from "react";


const statusesExcludedFromValue = ["DRAFT", "UNDER_REVIEW"]
const AgreementTotalBudgetLinesCard = ({ budgetLineItems }) => {
    const headerText = "Total Agreement Value";
    const valuedBlis = budgetLineItems.filter(bli => !(statusesExcludedFromValue.includes(bli.status)));
    const valuedBlisFy = valuedBlis.map(bli => ({ ...bli, fiscalYear: fiscalYearFromDate(bli.date_needed) }))
    const fyValues = valuedBlisFy.reduce((acc, cur) => {
        if (!cur.fiscalYear || cur.amount == null) return acc;
        if (!(cur.fiscalYear in acc)) {
            acc[cur.fiscalYear] = cur.amount;
        }
        else {
            acc[cur.fiscalYear] = acc[cur.fiscalYear] + cur.amount;
        }
        return acc
    }, {});
    // const totalValue = fyValues.reduce((acc, cur) => acc + cur, 0)
    const currentFiscalYear = fiscalYearFromDate(new Date());


    // ~~~~~

    const total_value = 3500000.00;
    const ratio = 4;
    const fiscalYear = { value: 2024 }
    const data = [
        {
            id: 1,
            label: `FY ${fiscalYear.value} Total Spending`,
            value: "8000000.00",
            color: "#B6406C",
            percent: `${calculatePercent("8000000.00", total_value)}%`,
        },
        {
            id: 2,
            label: `FY ${fiscalYear.value} Remaining Budget`,
            value: "2000000.00",
            color: "#A9AEB1 ",
            percent: `${calculatePercent("2000000.00", total_value)}%`,
        },
    ];


    return (
        <CurrencySummaryCard headerText={headerText} amount={total_value}>
            <ul>
                <li>FY 2023 <div style={{width: "100px", backgroundColor: "#336633", borderWidth: "1px", borderBottomRightRadius: "4px", borderTopRightRadius: "4px"}}>X</div></li>
            </ul>
            <div style={{width: "100px", backgroundColor: "#336633", borderWidth: "1px", borderBottomRightRadius: "4px", borderTopRightRadius: "4px"}}>X</div>
            <div style={{width: "100px", backgroundColor: "#336633", borderWidth: "1px", borderBottomRightRadius: "4px", borderTopRightRadius: "4px"}}>X</div>
            {/*<span>test</span>*/}
            <div style={{width: "100px", backgroundColor: "#666699", borderWidth: "1px", borderBottomRightRadius: "4px", borderTopRightRadius: "4px"}}>?</div>
    {/*        border-width: 1px;*/}
    {/*border-bottom-right-radius: 4px;*/}
    {/*border-top-right-radius: 4px;*/}
            <div id="currency-summary-card" className="margin-top-2">

                <div className={styles.barBox}>
                    <div
                        className={styles.leftBar}
                        style={{ flex: 1, border:"1px", backgroundColor: data[0].color }}
                        onMouseEnter={() => setActiveId(data[0].id)}
                        onMouseLeave={() => setActiveId(0)}
                    />
                    <div
                        className={`${styles.rightBar} ${ratio === 0 ? styles.rightBarFull : ""}`}
                        style={{ backgroundColor: data[1].color }}
                        onMouseEnter={() => setActiveId(data[1].id)}
                        onMouseLeave={() => setActiveId(0)}
                    />
                </div>
            </div>
        </CurrencySummaryCard>
        // <RoundedBox className="padding-y-205 padding-x-4 padding-right-9 display-inline-block">
        //     <div className="">
        //         <article>
        //             <h3 className="margin-0 margin-bottom-3 font-12px text-base-dark text-normal">{headerText}</h3>
        //         </article>
        //     </div>
        // </RoundedBox>
    );
};

export default AgreementTotalBudgetLinesCard;
