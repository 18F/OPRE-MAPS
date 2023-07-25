import RoundedBox from "../../UI/RoundedBox/RoundedBox";
import { StatusTagList } from "../../UI/Tag/StatusTag";

const AgreementTotalBudgetLinesCard = ({ numberOfAgreements = 0, countsByStatus = {} }) => {
    const headerText = "Total Budget Lines";

    return (
        <RoundedBox className="padding-y-205 padding-x-4 padding-right-9 display-inline-block">
            <div className="">
                <article data-cy="agreement-total-budget-lines-card-article">
                    <h3 className="margin-0 margin-bottom-3 font-12px text-base-dark text-normal">{headerText}</h3>
                    <div className="display-flex flex-justify width-fit-content">
                        <span className="font-sans-xl text-bold line-height-sans-1" data-cy="number-of-agreements">{numberOfAgreements}</span>
                        <div className="display-flex flex-column margin-left-105 grid-gap">
                            <StatusTagList countsByStatus={countsByStatus} />
                        </div>
                    </div>
                </article>
            </div>
        </RoundedBox>
    );
};

export default AgreementTotalBudgetLinesCard;
