import React from "react";
import { useNavigate } from "react-router-dom";
import useAlert from "../../../helpers/use-alert";
import { useDeleteAgreementMutation } from "../../../api/opsAPI";

export const useAgreementApproval = () => {
    const navigate = useNavigate();

    const handleSubmitAgreementForApproval = (id) => {
        navigate(`/agreements/approve/${id}`);
    };

    return handleSubmitAgreementForApproval;
};

export const useHandleEditAgreement = () => {
    const navigate = useNavigate();

    const handleEditAgreement = (id) => {
        navigate(`/agreements/${id}?mode=edit`);
    };

    return handleEditAgreement;
};

export const useHandleDeleteAgreement = () => {
    const [showModal, setShowModal] = React.useState(false);
    const [modalProps, setModalProps] = React.useState({});
    const [deleteAgreement] = useDeleteAgreementMutation();
    const { setAlert } = useAlert();

    /**
     * Deletes an agreement.
     * @param {number} id - The id of the agreement to delete.
     * @param {string} agreementName - The name of the agreement to delete.
     * @returns {void}
     */
    const handleDeleteAgreement = (id, agreementName) => {
        setShowModal(true);
        setModalProps({
            heading: "Are you sure you want to delete this agreement?",
            actionButtonText: "Delete",
            handleConfirm: () => {
                deleteAgreement(id)
                    .unwrap()
                    .then((fulfilled) => {
                        console.log(`DELETE agreement success: ${JSON.stringify(fulfilled, null, 2)}`);
                        setAlert({
                            type: "success",
                            heading: "Agreement deleted",
                            message: `Agreement ${agreementName} has been successfully deleted.`
                        });
                    })
                    .catch((rejected) => {
                        console.error(`DELETE agreement rejected: ${JSON.stringify(rejected, null, 2)}`);
                        setAlert({
                            type: "error",
                            heading: "Error",
                            message: "An error occurred while deleting the agreement.",
                            redirectUrl: "/error"
                        });
                    });
            }
        });
    };

    return { handleDeleteAgreement, showModal, setShowModal, modalProps, setModalProps };
};
