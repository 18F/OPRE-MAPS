import PropTypes from "prop-types";
import Select from "../../UI/Select";
import { CONTRACT_TYPE_OPTIONS } from "../servicesComponents.constants";

/**
 * ContractTypeSelect component.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} props.value - The current value of the select.
 * @param {Function} props.onChange - Function to call when the select value changes.
 * @param {Object} props.rest - Additional props to pass to the Select component.
 *
 * @returns {JSX.Element} The rendered component.
 */
function ContractTypeSelect({ value, onChange, ...rest }) {
    return (
        <Select
            name="contractType"
            label="Contract Type"
            options={CONTRACT_TYPE_OPTIONS}
            onChange={onChange}
            value={value}
            messages={[]}
            {...rest}
        />
    );
}

ContractTypeSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    rest: PropTypes.object
};

export default ContractTypeSelect;
