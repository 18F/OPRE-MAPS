import cx from "clsx";

/**
 * A form input component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the input field.
 * @param {string} [props.label] - The label to display for the input field (optional).
 * @param {Function} props.onChange - A function to call when the input value changes.
 * @param {boolean} [props.pending] - A flag to indicate if the input is pending (optional).
 * @param {Array<String>} [props.messages] - An array of error messages to display (optional).
 * @param {string} [props.value] - The value of the input field.(optional)
 * @param {string} [props.className] - Additional CSS classes to apply to the component (optional).
 * @param {boolean} [props.disabled] - A flag to indicate if the input is disabled (optional).
 * @returns {JSX.Element} - The rendered input component.
 */
const Input = ({
    name,
    label = name,
    onChange,
    pending = false,
    messages = [],
    value,
    className,
    disabled = false,
}) => {
    return (
        <div className={cx("usa-form-group", pending && "pending", className)}>
            <label className={`usa-label ${messages.length ? "usa-label--error" : null} `} htmlFor={name}>
                {label}
            </label>
            {messages.length ? (
                <span className="usa-error-message" role="alert">
                    {messages[0]}
                </span>
            ) : null}
            <input
                id={name}
                name={name}
                className={`usa-input ${messages.length ? "usa-input--error" : null} `}
                onChange={(e) => onChange(e)}
                autoComplete="off"
                autoCorrect="off"
                value={value}
                disabled={disabled}
            />
        </div>
    );

    // function handleChange(e) {
    //     onChange(name, e.target.value);
    // }
};

export default Input;
