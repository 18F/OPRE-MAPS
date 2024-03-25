import PropTypes from "prop-types";
import ServicesComponentForm from "./ServicesComponentForm";
import ServicesComponentsList from "./ServicesComponentsList";
import ConfirmationModal from "../UI/Modals/ConfirmationModal";
import useServicesComponents from "./servicesComponents.hooks";

/**
 * ServicesComponents is a component that handles the display and functionality of service components.
 *
 * @component
 * @param {object} props
 * @param {string} props.serviceRequirementType - The type of service requirement.
 * @param {number} props.agreementId - The ID of the agreement.
 * @param {boolean} [props.isEditMode] - Whether the component is in edit mode.
 * @returns {JSX.Element}
 *
 * @example
 *  <ServicesComponents serviceRequirementType="SEVERABLE" agreementId={123} />
 */
const ServicesComponents = ({ serviceRequirementType, agreementId, isEditMode = false }) => {
    const {
        formData,
        modalProps,
        servicesComponents,
        setFormData,
        setShowModal,
        showModal,
        handleSubmit,
        handleDelete,
        handleCancel,
        setFormDataById,
        servicesComponentsNumbers
    } = useServicesComponents(agreementId);

    return (
        <>
            {showModal && (
                <ConfirmationModal
                    heading={modalProps.heading}
                    setShowModal={setShowModal}
                    actionButtonText={modalProps.actionButtonText}
                    secondaryButtonText={modalProps.secondaryButtonText}
                    handleConfirm={modalProps.handleConfirm}
                />
            )}
            <section>
                <ServicesComponentForm
                    serviceTypeReq={serviceRequirementType}
                    formData={formData}
                    setFormData={setFormData}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    servicesComponentsNumbers={servicesComponentsNumbers}
                    isEditMode={isEditMode}
                />
            </section>
            <ServicesComponentsList
                servicesComponents={servicesComponents}
                setFormDataById={setFormDataById}
                handleDelete={handleDelete}
                serviceTypeReq={serviceRequirementType}
            />
        </>
    );
};

ServicesComponents.propTypes = {
    serviceRequirementType: PropTypes.string.isRequired,
    agreementId: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool
};
export default ServicesComponents;
