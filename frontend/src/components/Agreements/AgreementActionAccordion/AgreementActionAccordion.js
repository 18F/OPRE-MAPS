import PropTypes from "prop-types";
import RadioButtonTile from "../../UI/RadioButtonTile";
import Accordion from "../../UI/Accordion";

/**
 * Renders an accordion component with two radio button tiles for selecting an action.
 * @param {Object} props - The component props.
 * @param {Function} props.setAction - The function to call when an action is selected.
 * @param {boolean} [props.optionOneDisabled=false] - Whether the first radio button tile should be disabled.
 * @param {boolean} [props.optionTwoDisabled=false] - Whether the second radio button tile should be disabled.
 * @returns {React.JSX.Element} - The rendered component.
 */
const AgreementActionAccordion = ({ setAction, optionOneDisabled = false, optionTwoDisabled = false }) => {
    return (
        <Accordion
            heading="Choose an Action"
            level={2}
        >
            <fieldset className="usa-fieldset">
                <legend className="usa-legend maxw-full margin-bottom-2 margin-top-0">
                    Choose which action you’d like to initiate and then select the budget lines below.
                </legend>
                <div className="grid-row grid-gap">
                    <div className="grid-col">
                        <RadioButtonTile
                            label="Change Draft Budget Lines to Planned Status"
                            description="This will subtract the amounts from the FY budget"
                            setValue={setAction}
                            disabled={optionOneDisabled}
                        />
                    </div>
                    <div className="grid-col">
                        <RadioButtonTile
                            label="Change Planned Budget Lines to Executing Status"
                            description="This will start the procurement process"
                            setValue={setAction}
                            disabled={optionTwoDisabled}
                        />
                    </div>
                </div>
            </fieldset>
        </Accordion>
    );
};

AgreementActionAccordion.propTypes = {
    setAction: PropTypes.func.isRequired,
    optionOneDisabled: PropTypes.bool,
    optionTwoDisabled: PropTypes.bool
};

export default AgreementActionAccordion;
