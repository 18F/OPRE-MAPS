import * as React from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useGetAgreementByIdQuery, useGetServicesComponentsListQuery } from "../../../api/opsAPI";
import { BLI_STATUS, groupByServicesComponent } from "../../../helpers/budgetLines.helpers";
import { getInReviewChangeRequests } from "../../../helpers/changeRequests.helpers";
import { renderField, toTitleCaseFromSlug } from "../../../helpers/utils";
import useAlert from "../../../hooks/use-alert.hooks.js";
import useGetUserFullNameFromId from "../../../hooks/user.hooks";
import useToggle from "../../../hooks/useToggle";
import { getTotalByCans } from "../review/ReviewAgreement.helpers";

/**
 * Custom hook for managing the approval process of an agreement
 * @typedef {Object} ApproveAgreementHookResult
 * @property {Object|null} agreement - The agreement data
 * @property {string} projectOfficerName - The name of the project officer
 * @property {Object[]} servicesComponents - The services components
 * @property {Object[]} groupedBudgetLinesByServicesComponent - The budget lines grouped by services component
 * @property {Object[]} budgetLinesInReview - The budget lines in review
 * @property {Object[]} changeRequestsInReview - The change requests in review
 * @property {Object} changeInCans - The change in CANs
 * @property {string} notes - The reviewer notes
 * @property {Function} setNotes - The setter for reviewer notes
 * @property {boolean} confirmation - The confirmation state
 * @property {function(boolean): void} setConfirmation - The setter for confirmation state
 * @property {boolean} showModal - The modal visibility state
 * @property {function(boolean): void} setShowModal - The setter for modal visibility
 * @property {Object} modalProps - The modal properties
 * @property {string} checkBoxText - The text for the confirmation checkbox
 * @property {Function} handleCancel - Function to handle cancellation
 * @property {Function} handleDecline - Function to handle decline
 * @property {Function} handleApprove - Function to handle approval
 * @property {string} title - The title of the approval page
 * @property {boolean} afterApproval - The after approval state
 * @property {Function} setAfterApproval - The setter for after approval state
 * @property {string} submittersNotes - The submitter's notes
 * @property {string} changeToStatus - The status to change to
 * @property {string} statusForTitle - The status for the title
 * @property {string} changeRequestTitle - The title of the change request,
 * @property {{APPROVE: string, DECLINE: string, CANCEL: string}} ACTION_TYPES - The action types for approval processes
 *
 * @returns {ApproveAgreementHookResult} The data and functions for the approval process
 */
const useApproveAgreement = () => {
    const { setAlert } = useAlert();
    const urlPathParams = useParams();
    const [notes, setNotes] = React.useState("");
    const [confirmation, setConfirmation] = React.useState(false);
    const [showModal, setShowModal] = React.useState(false);
    const [modalProps, setModalProps] = React.useState({
        heading: "",
        actionButtonText: "",
        secondaryButtonText: "",
        handleConfirm: () => {}
    });

    const CHANGE_REQUEST_SLUG_TYPES = {
        STATUS: "status-change",
        BUDGET: "budget-change"
    };

    const ACTION_TYPES = {
        APPROVE: "APPROVE",
        DECLINE: "DECLINE",
        CANCEL: "CANCEL"
    };
    let submittersNotes = "This is a test note"; // TODO: replace with actual data
    // @ts-ignore
    const agreementId = +urlPathParams.id;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    let changeRequestType = searchParams.get("type") ?? "";
    let changeToStatus = searchParams.get("to")?.toUpperCase() ?? "";
    const checkBoxText =
        changeToStatus === BLI_STATUS.PLANNED
            ? "I understand that approving these budget lines will subtract the amounts from the FY budget"
            : "I understand that approving these budget lines will start the Procurement Process";
    const approveModalHeading =
        changeToStatus === BLI_STATUS.PLANNED
            ? "Are you sure you want to approve these budget lines for Planned Status? This will subtract the amounts from the FY budget."
            : "Are you sure you want to approve these budget lines for Executing Status? This will start the procurement process.";
    const [afterApproval, setAfterApproval] = useToggle(true);

    const {
        data: agreement,
        error: errorAgreement,
        isLoading: isLoadingAgreement
    } = useGetAgreementByIdQuery(agreementId, {
        refetchOnMountOrArgChange: true
    });

    const projectOfficerName = useGetUserFullNameFromId(agreement?.project_officer_id);
    const { data: servicesComponents } = useGetServicesComponentsListQuery(agreement?.id);

    if (isLoadingAgreement) {
        return <h1>Loading...</h1>;
    }
    if (errorAgreement) {
        return <h1>Oops, an error occurred</h1>;
    }

    const groupedBudgetLinesByServicesComponent = agreement?.budget_line_items
        ? groupByServicesComponent(agreement.budget_line_items)
        : [];
    const budgetLinesInReview = agreement?.budget_line_items?.filter((bli) => bli.in_review) || [];
    /**
     *  @typedef {import('../../../components/ChangeRequests/ChangeRequestsList/ChangeRequests').ChangeRequest} ChangeRequest
     *  @type {ChangeRequest[]}
     */
    const changeRequestsInReview = /** @type {ChangeRequest[]} */ (
        getInReviewChangeRequests(agreement?.budget_line_items)
    );
    const changeInCans = getTotalByCans(budgetLinesInReview);

    let statusForTitle = "";
    if (changeRequestType === CHANGE_REQUEST_SLUG_TYPES.STATUS) {
        const status = changeToStatus === "EXECUTING" ? BLI_STATUS.EXECUTING : BLI_STATUS.PLANNED;
        statusForTitle = `- ${renderField(null, "status", status)}`;
    }
    const changeRequestTitle = toTitleCaseFromSlug(changeRequestType);
    const title = `Approval for ${changeRequestTitle} ${statusForTitle}`;

    const handleCancel = () => {
        setShowModal(true);
        setModalProps({
            heading:
                "Are you sure you want to cancel? This will exit the review process and you can come back to it later.",
            actionButtonText: "Cancel",
            secondaryButtonText: "Continue Reviewing",
            handleConfirm: () => {
                navigate("/agreements");
            }
        });
    };

    const declineChangeRequest = () => {
        setAlert({
            type: "success",
            heading: "Not Yet Implemented",
            message: "Not yet implemented"
        });
    };

    const handleDecline = async () => {
        setShowModal(true);
        setModalProps({
            heading: `Are you sure you want to decline these budget lines for ${changeToStatus} Status?`,
            actionButtonText: "Decline",
            secondaryButtonText: "Cancel",
            handleConfirm: async () => {
                await declineChangeRequest();
                navigate("/agreements");
            }
        });
    };

    const approveChangeRequest = (action) => {
        console.log({ action });
        if (action === ACTION_TYPES.APPROVE) {
            setAlert({
                type: "success",
                heading: "Not Yet Implemented",
                message: "Not yet implemented"
            });
        }
    };
    // TODO: refactor to handle all cases
    const handleApprove = async (action) => {
        setShowModal(true);
        setModalProps({
            heading: approveModalHeading,
            actionButtonText: "Approve",
            secondaryButtonText: "Cancel",
            handleConfirm: async () => {
                await approveChangeRequest(action);
                await navigate("/agreements");
            }
        });
    };
    return {
        agreement,
        projectOfficerName,
        servicesComponents,
        groupedBudgetLinesByServicesComponent,
        budgetLinesInReview,
        changeRequestsInReview,
        changeInCans,
        notes,
        setNotes,
        confirmation,
        setConfirmation,
        showModal,
        setShowModal,
        modalProps,
        checkBoxText,
        handleCancel,
        handleDecline,
        handleApprove,
        title,
        changeRequestTitle,
        afterApproval,
        setAfterApproval,
        submittersNotes,
        changeToStatus,
        statusForTitle,
        ACTION_TYPES
    };
};

export default useApproveAgreement;
