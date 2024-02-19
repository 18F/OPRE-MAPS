import StepCreateBLIsAndSCs from "./StepCreateBLIsAndSCs";
import { CreateBudgetLinesProvider } from "./context";

/**
 * Renders the Create Budget Lines component with React context.
 *
 * @param {Object} props - The component props.
 * @param {Function} [props.goToNext] - A function to navigate to the next step in the flow. - optional
 * @param {Function} [props.goBack] - A function to navigate to the previous step in the flow. - optional
 * @param {Array<String>} props.wizardSteps - An array of objects representing the steps in the flow.
 * @param {number} props.currentStep - The index of the current step in the flow.
 * @param {Object} props.selectedResearchProject - The selected research project.
 * @param {Object} props.selectedAgreement - The selected agreement.
 * @param {Object} props.selectedProcurementShop - The selected procurement shop.
 * @param {Array<any>} props.existingBudgetLines - An array of existing budget lines.
 * @param {string} props.continueBtnText - The text to display on the "Continue" button.
 * @param {boolean} props.isEditMode - Whether or not the form is in edit mode.
 * @param {boolean} props.isReviewMode - Whether or not the form is in review mode.
 * @param {Function} [props.continueOverRide] - A function to override the default continue functionality.- optional
 * @param {"agreement" | "budgetLines"} props.workflow - The workflow type ("agreement" or "budgetLines").
 * @returns {JSX.Element} - The rendered component.
 */
const CreateBudgetLines = ({
    goToNext,
    goBack,
    wizardSteps,
    currentStep,
    selectedResearchProject,
    selectedAgreement,
    selectedProcurementShop,
    existingBudgetLines,
    continueBtnText,
    continueOverRide,
    isEditMode,
    isReviewMode,
    workflow
}) => {
    return (
        <CreateBudgetLinesProvider>
            <StepCreateBLIsAndSCs
                goToNext={goToNext}
                goBack={goBack}
                wizardSteps={wizardSteps}
                currentStep={currentStep}
                selectedResearchProject={selectedResearchProject}
                selectedAgreement={selectedAgreement}
                selectedProcurementShop={selectedProcurementShop}
                existingBudgetLines={existingBudgetLines}
                continueBtnText={continueBtnText}
                continueOverRide={continueOverRide}
                isEditMode={isEditMode}
                isReviewMode={isReviewMode}
                workflow={workflow}
            />
        </CreateBudgetLinesProvider>
    );
};

export default CreateBudgetLines;
