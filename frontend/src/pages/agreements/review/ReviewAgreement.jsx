import { Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import classnames from "vest/classnames";
import SimpleAlert from "../../../components/UI/Alert/SimpleAlert";
import { useGetAgreementByIdQuery } from "../../../api/opsAPI";
import { useAddApprovalRequestMutation } from "../../../api/opsAPI";
import AgreementMetaAccordion from "../../../components/Agreements/AgreementMetaAccordion";
import { convertCodeForDisplay } from "../../../helpers/utils";
import suite from "./suite";
import { useIsAgreementEditable, useIsUserAllowedToEditAgreement } from "../../../hooks/agreement.hooks";
import useAlert from "../../../hooks/use-alert.hooks";
import useGetUserFullNameFromId from "../../../hooks/user.hooks";
import AgreementActionAccordion from "../../../components/Agreements/AgreementActionAccordion";
import AgreementBLIAccordion from "../../../components/Agreements/AgreementBLIAccordion";
import AgreementChangesAccordion from "../../../components/Agreements/AgreementChangesAccordion";
import {
    anyBudgetLinesByStatus,
    getSelectedBudgetLines,
    selectedBudgetLinesTotal,
    getTotalBySelectedCans
} from "./ReviewAgreement.helpers";
import AgreementBLIReviewTable from "../../../components/BudgetLineItems/BLIReviewTable";
import useReviewAgreement from "./reviewAgreement.hooks";
import AgreementCANReviewAccordion from "../../../components/Agreements/AgreementCANReviewAccordion";
import App from "../../../App";
import useToggle from "../../../hooks/useToggle";
import TextArea from "../../../components/UI/Form/TextArea";
import PageHeader from "../../../components/UI/PageHeader";
import { actionOptions } from "./ReviewAgreement.constants";

/**
 * Renders a page for reviewing and sending an agreement to approval.
 * @returns {React.JSX.Element} - The rendered component.
 */

export const ReviewAgreement = () => {
    const urlPathParams = useParams();
    const agreementId = urlPathParams?.id;
    const navigate = useNavigate();
    const {
        isSuccess,
        data: agreement,
        error: errorAgreement,
        isLoading: isLoadingAgreement
    } = useGetAgreementByIdQuery(agreementId, {
        refetchOnMountOrArgChange: true
    });
    const activeUser = useSelector((state) => state.auth.activeUser);

    const [addApprovalRequest] = useAddApprovalRequestMutation();
    const isAgreementStateEditable = useIsAgreementEditable(agreement?.id);
    const canUserEditAgreement = useIsUserAllowedToEditAgreement(agreement?.id);
    const isAgreementEditable = isAgreementStateEditable && canUserEditAgreement;
    const projectOfficerName = useGetUserFullNameFromId(agreement?.project_officer_id);
    const [afterApproval, setAfterApproval] = useToggle(true);
    const { setAlert } = useAlert();
    const {
        budgetLines,
        handleSelectBLI,
        pageErrors,
        isAlertActive,
        res,
        handleActionChange,
        toggleSelectActionableBLIs,
        mainToggleSelected,
        setMainToggleSelected,
        notes,
        setNotes,
        action
    } = useReviewAgreement(agreement, isSuccess);

    const cn = classnames(suite.get(), {
        invalid: "usa-form-group--error",
        valid: "success",
        warning: "warning"
    });

    if (isLoadingAgreement) {
        return <h1>Loading...</h1>;
    }
    if (errorAgreement) {
        return <h1>Oops, an error occurred</h1>;
    }

    // convert page errors about budget lines object into an array of objects
    const budgetLinePageErrors = Object.entries(pageErrors).filter((error) => error[0].includes("Budget line item"));
    const budgetLinePageErrorsExist = budgetLinePageErrors.length > 0;
    const budgetLineErrors = res.getErrors("budget-line-items");
    const budgetLineErrorsExist = budgetLineErrors.length > 0;
    const areThereBudgetLineErrors = budgetLinePageErrorsExist || budgetLineErrorsExist;
    const anyBudgetLinesDraft = anyBudgetLinesByStatus(agreement, "DRAFT");
    const anyBudgetLinePlanned = anyBudgetLinesByStatus(agreement, "PLANNED");
    const changeInCans = getTotalBySelectedCans(budgetLines);
    let workflow_action = "";
    switch (action) {
        case actionOptions.CHANGE_DRAFT_TO_PLANNED:
            workflow_action = "DRAFT_TO_PLANNED";
            break;
        case actionOptions.CHANGE_PLANNED_TO_EXECUTING:
            workflow_action = "PLANNED_TO_EXECUTING";
            break;
    }
    const isAnythingSelected = getSelectedBudgetLines(budgetLines).length > 0;
    const isDRAFTSubmissionReady =
        anyBudgetLinesDraft && action === actionOptions.CHANGE_DRAFT_TO_PLANNED && isAnythingSelected;
    const isPLANNEDSubmissionReady =
        anyBudgetLinePlanned && action === actionOptions.CHANGE_PLANNED_TO_EXECUTING && isAnythingSelected;
    const isSubmissionReady = isDRAFTSubmissionReady || isPLANNEDSubmissionReady;

    const handleSendToApproval = () => {
        if (anyBudgetLinesDraft) {
            //Create BLI Package, and send it to approval (create a Workflow)
            const bli_ids = getSelectedBudgetLines(budgetLines).map((bli) => bli.id);
            const user_id = activeUser?.id;
            const notes = "";
            console.log("BLI Package Data:", bli_ids, user_id, notes);
            console.log("THE ACTION IS:", action);
            addApprovalRequest({
                budget_line_item_ids: bli_ids,
                submitter_id: user_id,
                notes: notes,
                workflow_action: workflow_action
            })
                .unwrap()
                .then((fulfilled) => {
                    console.log("BLI Status Updated:", fulfilled);
                    setAlert({
                        type: "success",
                        heading: "Agreement sent to approval",
                        message: "The agreement has been successfully sent to approval for Planned Status.",
                        redirectUrl: "/agreements"
                    });
                })
                .catch((rejected) => {
                    console.log("Error Updating Budget Line Status");
                    console.dir(rejected);
                    setAlert({
                        type: "error",
                        heading: "Error",
                        message: "An error occurred. Please try again.",
                        redirectUrl: "/error"
                    });
                });
        }
    };

    return (
        <App breadCrumbName="Request BL Status Change">
            {isAlertActive && Object.entries(pageErrors).length > 0 ? (
                <SimpleAlert
                    type="error"
                    heading="Please resolve the errors outlined below"
                    message="In order to send this agreement to approval, click edit to update the required information."
                >
                    <ul data-cy="error-list">
                        {Object.entries(pageErrors).map(([key, value]) => (
                            <li
                                key={key}
                                data-cy="error-item"
                            >
                                <strong>{convertCodeForDisplay("validation", key)}: </strong>
                                {
                                    <span>
                                        {value.map((message, index) => (
                                            <Fragment key={index}>
                                                <span>{message}</span>
                                                {index < value.length - 1 && <span>, </span>}
                                            </Fragment>
                                        ))}
                                    </span>
                                }
                            </li>
                        ))}
                    </ul>
                </SimpleAlert>
            ) : (
                <PageHeader
                    title="Request BL Status Change"
                    subTitle={agreement?.name}
                />
            )}
            <AgreementMetaAccordion
                agreement={agreement}
                projectOfficerName={projectOfficerName}
                res={res}
                cn={cn}
                convertCodeForDisplay={convertCodeForDisplay}
            />
            <AgreementActionAccordion
                setAction={handleActionChange}
                optionOneDisabled={!anyBudgetLinesDraft}
                optionTwoDisabled={!anyBudgetLinePlanned}
            />

            <AgreementBLIAccordion
                title="Select Budget Lines"
                budgetLineItems={getSelectedBudgetLines(budgetLines)}
                agreement={agreement}
                afterApproval={afterApproval}
                setAfterApproval={setAfterApproval}
            >
                <div className={`font-12px usa-form-group ${areThereBudgetLineErrors ? "usa-form-group--error" : ""}`}>
                    {areThereBudgetLineErrors && (
                        <ul className="usa-error-message padding-left-2 border-left-05">
                            {budgetLineErrorsExist && (
                                <li>
                                    {budgetLineErrors.map((error, index) => (
                                        <Fragment key={index}>
                                            <span>{error}</span>
                                            {index < budgetLineErrors.length - 1 && <span>, </span>}
                                        </Fragment>
                                    ))}
                                </li>
                            )}
                            {budgetLinePageErrorsExist &&
                                budgetLinePageErrors.map(([budgetLineItem, errors]) => (
                                    <li key={budgetLineItem}>
                                        {budgetLineItem}: {errors.join(", ")}
                                    </li>
                                ))}
                        </ul>
                    )}
                </div>
                <AgreementBLIReviewTable
                    readOnly={true}
                    budgetLines={budgetLines}
                    isReviewMode={true}
                    showTotalSummaryCard={false}
                    setSelectedBLIs={handleSelectBLI}
                    toggleSelectActionableBLIs={toggleSelectActionableBLIs}
                    mainToggleSelected={mainToggleSelected}
                    setMainToggleSelected={setMainToggleSelected}
                />
            </AgreementBLIAccordion>
            <AgreementCANReviewAccordion
                selectedBudgetLines={getSelectedBudgetLines(budgetLines)}
                afterApproval={afterApproval}
                setAfterApproval={setAfterApproval}
            />
            <AgreementChangesAccordion
                changeInBudgetLines={selectedBudgetLinesTotal(budgetLines)}
                changeInCans={changeInCans}
            />
            <h2 className="font-sans-lg text-semibold">Notes</h2>
            <TextArea
                name="submitter-notes"
                label="Notes (optional)"
                maxLength={150}
                value={notes}
                onChange={(name, value) => setNotes(value)}
            />
            <div className="grid-row flex-justify-end margin-top-1">
                <button
                    className={`usa-button usa-button--outline margin-right-2 ${
                        !isAgreementEditable ? "usa-tooltip" : ""
                    }`}
                    data-cy="edit-agreement-btn"
                    title={!isAgreementEditable ? "Agreement is not editable" : ""}
                    onClick={() => {
                        navigate(`/agreements/edit/${agreement?.id}?mode=review`);
                    }}
                    disabled={!isAgreementEditable}
                >
                    Edit
                </button>
                <button
                    className={`usa-button ${!isSubmissionReady ? "usa-tooltip" : ""}`}
                    data-cy="send-to-approval-btn"
                    data-position={`${!isSubmissionReady ? "top" : ""}`}
                    title={!isSubmissionReady ? "Agreement is not able to be reviewed" : ""}
                    disabled={!isSubmissionReady || !res.isValid()}
                    onClick={handleSendToApproval}
                >
                    Send to Approval
                </button>
            </div>
        </App>
    );
};

export default ReviewAgreement;
