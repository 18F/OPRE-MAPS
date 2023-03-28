import { useDispatch, useSelector } from "react-redux";
import { setSelectedAgreement } from "./createBudgetLineSlice";
import { AGREEMENTS } from "./data";

export const AgreementSelect = () => {
    const dispatch = useDispatch();
    const agreements = useSelector(() => AGREEMENTS);
    const selectedAgreement = useSelector((state) => state.createBudgetLine.selected_agreement);
    const onChangeAgreementSelection = (agreementId = 0) => {
        if (agreementId === 0) {
            return;
        }
        dispatch(
            setSelectedAgreement({
                id: agreements[agreementId - 1].id,
                value: agreements[agreementId - 1].name,
                description: agreements[agreementId - 1].description,
                projectOfficer: agreements[agreementId - 1].project_officer,
                periodOfPerformance: `${agreements[agreementId - 1].period_of_performance_start} - ${
                    agreements[agreementId - 1].period_of_performance_end
                }`,
            })
        );
    };

    const AgreementSummaryCard = () => {
        return (
            <div
                className="bg-base-lightest font-family-sans font-12px border-1px border-base-light radius-sm margin-top-4"
                style={{ width: "23.9375rem", minHeight: "11.75rem" }}
            >
                <dl className="margin-0 padding-y-2 padding-x-105">
                    <dt className="margin-0 text-base-dark">Agreement</dt>
                    <dd className="text-semibold margin-0">{selectedAgreement.value}</dd>
                    <dt className="margin-0 text-base-dark margin-top-205">Description</dt>
                    <dd className="text-semibold margin-0">{selectedAgreement.description}</dd>
                    <div className="display-flex flex-justify margin-top-205">
                        <div className="display-flex flex-column">
                            <dt className="margin-0 text-base-dark">Project Officer</dt>
                            <dd className="text-semibold margin-0">{selectedAgreement.projectOfficer}</dd>
                        </div>
                        <div className="display-flex flex-column">
                            <dt className="margin-0 text-base-dark">Period of Performance</dt>
                            <dd className="text-semibold margin-0">{selectedAgreement.periodOfPerformance}</dd>
                        </div>
                    </div>
                </dl>
            </div>
        );
    };
    return (
        <div className="display-flex flex-justify padding-top-105">
            <div className="left-half width-full">
                {/* NOTE: Left side */}
                <label className="usa-label" htmlFor="agreement">
                    Agreements
                </label>
                <div className="usa-combo-box" data-enhanced="true">
                    <select
                        className="usa-select usa-sr-only usa-combo-box__select"
                        name="agreement"
                        id=""
                        aria-hidden="true"
                        tabIndex="-1"
                        value={selectedAgreement?.value}
                        onChange={(e) => onChangeAgreementSelection(e.target.value || 0)}
                    >
                        {agreements.map((agreement) => {
                            return (
                                <option key={agreement?.id} value={agreement?.id}>
                                    {agreement?.name}
                                </option>
                            );
                        })}
                    </select>
                    <input
                        id="agreement"
                        aria-owns="agreement--list"
                        aria-controls="agreement--list"
                        aria-autocomplete="list"
                        aria-describedby="agreement--assistiveHint"
                        aria-expanded="false"
                        autoCapitalize="off"
                        autoComplete="off"
                        className="usa-combo-box__input"
                        type="text"
                        role="combobox"
                        aria-activedescendant=""
                        defaultValue={selectedAgreement?.value}
                    />
                    <span className="usa-combo-box__clear-input__wrapper" tabIndex="-1">
                        <button
                            type="button"
                            className="usa-combo-box__clear-input"
                            aria-label="Clear the select contents"
                            onClick={() => dispatch(setSelectedAgreement({}))}
                        >
                            &nbsp;
                        </button>
                    </span>
                    <span className="usa-combo-box__input-button-separator">&nbsp;</span>
                    <span className="usa-combo-box__toggle-list__wrapper" tabIndex="-1">
                        <button
                            type="button"
                            tabIndex="-1"
                            className="usa-combo-box__toggle-list"
                            aria-label="Toggle the dropdown list"
                        >
                            &nbsp;
                        </button>
                    </span>
                    <ul
                        tabIndex="-1"
                        id="agreement--list"
                        className="usa-combo-box__list"
                        role="listbox"
                        aria-labelledby="agreement-label"
                        hidden
                    >
                        {agreements?.map((agreement, index) => {
                            return (
                                <li
                                    key={agreement?.id}
                                    aria-setsize={agreement?.length}
                                    aria-posinset={index + 1}
                                    aria-selected="false"
                                    id={`dynamic-select--list--option-${index}`}
                                    className="usa-combo-box__list-option"
                                    tabIndex={index === 0 ? "0" : "-1"}
                                    role="option"
                                    data-value={agreement?.name}
                                >
                                    {agreement?.name}
                                </li>
                            );
                        })}
                    </ul>
                    <div className="usa-combo-box__status usa-sr-only" role="status"></div>
                    <span id="agreement--assistiveHint" className="usa-sr-only">
                        When autocomplete results are available use up and down arrows to review and enter to select.
                        Touch device users, explore by touch or with swipe gestures.
                    </span>
                </div>
            </div>
            {/* NOTE: Right side */}
            <div className="right-half">{selectedAgreement?.id && <AgreementSummaryCard />}</div>
        </div>
    );
};
