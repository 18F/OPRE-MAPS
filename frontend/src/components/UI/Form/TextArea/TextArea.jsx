import cx from "clsx";
import React, { useEffect } from "react";
import USWDS from "@uswds/uswds/js";

const { characterCount } = USWDS;

/**
 * A textarea input component.
 *
 * @param {Object} props - The component props.
 * @param {string} props.name - The name of the input field.
 * @param {string} [props.label=name] - The label for the input field.
 * @param {string} [props.hintMsg] - The hint message for the input field.
 * @param {function} props.onChange - The change handler for the input field.
 * @param {boolean} [props.pending=false] - Whether the input field is pending.
 * @param {string[]} [props.messages=[]] - The error messages for the input field.
 * @param {string} props.value - The value of the input field.
 * @param {int} props.maxLength - The maximum number of characters allow.
 * @param {string} [props.className] - The CSS class for the input field.
 * @returns {JSX.Element} - The textarea input component.
 */
export const TextArea = ({
    name,
    label = name,
    hintMsg,
    onChange,
    pending = false,
    messages = [],
    value,
    maxLength,
    className
}) => {
    if (!hintMsg && maxLength) hintMsg = `Maximum ${maxLength} characters`;
    // const ref = document.body;
    const characterCountRef = React.useRef();

    useEffect(() => {
        // initialize
        characterCount.on(characterCountRef.current);

        // remove event listeners when the component un-mounts.
        return () => {
            characterCount.off(characterCountRef.current);
        };
    }, []);

    return (
        <div className="usa-character-count margin-top-3">
            <div className={cx("usa-form-group", pending && "pending", className)}>
                <label
                    className={`usa-label ${messages.length ? "usa-label--error" : null} `}
                    htmlFor={name}
                >
                    {label}
                </label>

                {messages.length ? (
                    <span
                        className="usa-error-message"
                        id="text-area-input-error-message"
                        role="alert"
                    >
                        {messages[0]}
                    </span>
                ) : (
                    <span
                        id={`${name}-with-hint-textarea-hint`}
                        className="usa-hint"
                    >
                        {hintMsg}
                    </span>
                )}
                <textarea
                    className={`usa-textarea usa-character-count__field ${
                        messages.length ? "usa-input--error" : null
                    } `}
                    id={name}
                    name={name}
                    rows={5}
                    style={{ height: "7rem" }}
                    maxLength={maxLength}
                    onChange={handleChange}
                    value={value}
                    aria-describedby={`${name}-with-hint-textarea-info ${name}-with-hint-textarea-hint`}
                />
            </div>
            <span
                id={`${name}-with-hint-textarea-info`}
                className="usa-character-count__message sr-only"
            >
                You can enter up to {maxLength} characters
            </span>
        </div>
    );

    function handleChange(e) {
        onChange(name, e.target.value);
    }
};

export default TextArea;
