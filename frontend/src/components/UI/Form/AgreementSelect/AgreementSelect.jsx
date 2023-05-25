export const AgreementSelect = ({
    selectedProject,
    selectedAgreement,
    setSelectedAgreement,
    setSelectedProcurementShop,
    setBudgetLinesAdded,
    agreements = {},
}) => {
    const onChangeAgreementSelection = (agreementId = 0) => {
        setBudgetLinesAdded([]); // reset budget lines
        const selectedAgreement = agreements.find((agreement) => agreement.id === agreementId);
        let periodOfPerformance = null;
        if (agreementId === 0) {
            setSelectedAgreement({});
            return;
        }
        if (selectedAgreement.period_of_performance_start && selectedAgreement.period_of_performance_end) {
            periodOfPerformance = `${selectedAgreement.period_of_performance_start} - ${selectedAgreement.period_of_performance_end}`;
        }
        setSelectedAgreement({
            ...selectedAgreement,
            projectOfficer: selectedAgreement?.project_officer,
            periodOfPerformance,
        });

        // set budget line items and procurement shop
        if (selectedAgreement?.budget_line_items.length > 0) {
            setBudgetLinesAdded(selectedAgreement?.budget_line_items);
            setSelectedProcurementShop(selectedAgreement?.procurement_shop);
        }
    };

    const AgreementSummaryCard = () => {
        return (
            <div
                className="bg-base-lightest font-family-sans font-12px border-1px border-base-light radius-sm margin-top-4"
                style={{ width: "23.9375rem", minHeight: "11.75rem" }}
                data-cy="agreement-summary-card"
                data-testid="agreement-summary-card"
            >
                <dl className="margin-0 padding-y-2 padding-x-105">
                    <dt className="margin-0 text-base-dark">Agreement</dt>
                    <dd className="text-semibold margin-0">{selectedAgreement.name}</dd>
                    <dt className="margin-0 text-base-dark margin-top-205">Description</dt>
                    <dd className="text-semibold margin-0">{selectedAgreement.description}</dd>
                    <div className="display-flex flex-justify margin-top-205">
                        <div className="display-flex flex-column">
                            {/* TODO: add project officer name */}
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
                <fieldset className="usa-fieldset" disabled={!selectedProject?.id && !setSelectedAgreement?.id > 0}>
                    <label className="usa-label" htmlFor="agreement">
                        Agreements
                    </label>
                    <select
                        className="usa-select width-full"
                        name="agreement"
                        id="agreement"
                        data-testid="agreement-select"
                        onChange={(e) => onChangeAgreementSelection(Number(e.target.value))}
                        value={selectedAgreement?.id || ""}
                        required
                    >
                        <option value={0}>- Select -</option>
                        {agreements.length > 0 &&
                            agreements.map((agreement) => (
                                <option key={agreement?.id} value={agreement?.id}>
                                    {agreement?.name}
                                </option>
                            ))}
                    </select>
                </fieldset>
            </div>
            {/* NOTE: Right side */}
            <div className="right-half">{selectedAgreement?.id && <AgreementSummaryCard />}</div>
        </div>
    );
};

export default AgreementSelect;
