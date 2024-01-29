import PropTypes from "prop-types";
import cx from "clsx";

/**
 * Renders a select input for choosing a month.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the input.
 * @param {string} [props.label=name] - The label for the input.
 * @param {function} props.onChange - A function to call when the input value changes.
 * @param {boolean} [props.pending=false] - Whether the input is in a pending state.
 * @param {string[]} [props.messages=[]] - An array of error messages to display.
 * @param {number} props.value - The currently selected value.
 * @returns {JSX.Element} - The rendered component.
 */
const MonthSelect = ({ name, label = name, onChange, pending = false, messages = [], value }) => {
    function handleChange(e) {
        onChange(name, e.target.value);
    }
    return (
        <div className={cx("usa-form-group usa-form-group--month margin-top-0", pending && "pending")}>
            <label
                className={`usa-label sr-only ${messages.length ? "usa-label--error" : null} `}
                htmlFor={name}
            >
                {label}
            </label>
            <select
                className={`usa-select ${messages.length ? "usa-input--error" : null}`}
                id={name}
                name={name}
                aria-describedby="mdHint"
                style={{ width: "6.9375rem" }}
                onChange={handleChange}
                value={value}
            >
                <option value="0">Month</option>
                <option value="1">01 - Jan</option>
                <option value="2">02 - Feb</option>
                <option value="3">03 - Mar</option>
                <option value="4">04 - Apr</option>
                <option value="5">05 - May</option>
                <option value="6">06 - Jun</option>
                <option value="7">07 - Jul</option>
                <option value="8">08 - Aug</option>
                <option value="9">09 - Sep</option>
                <option value="10">10 - Oct</option>
                <option value="11">11 - Nov</option>
                <option value="12">12 - Dec</option>
            </select>
        </div>
    );
};

MonthSelect.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    messages: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.number.isRequired
};

export default MonthSelect;
