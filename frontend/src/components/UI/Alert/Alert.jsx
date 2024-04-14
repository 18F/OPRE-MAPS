import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { setIsActive, clearState } from "./alertSlice";
/**
 * A component that displays an alert and optionally navigates after a delay.
 * @component
 * @param {Object} props - The component props.
 * @param {JSX.Element} [props.children] - The child elements to render. - optionally
 * @returns {JSX.Element} The JSX element to render.
 */
export const Alert = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { heading, message, type, redirectUrl } = useSelector((state) => state.alert);
    const [isFromRedirect, setIsFromRedirect] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(true);
    let waitTime = redirectUrl ? 3000 : 2000;

    // Scroll to top only when the alert is first displayed
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Handle navigation without blocking user interactions
    useEffect(() => {
        let timeout;
        if (redirectUrl) {
            setIsFromRedirect(true);
            timeout = setTimeout(() => {
                navigate(redirectUrl);
            }, waitTime);
        }

        return () => {
            clearTimeout(timeout);
            setIsFromRedirect(false);
        };
    }, [navigate, redirectUrl, waitTime]);

    // Manage alert visibility and auto-dismiss without affecting navigation
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(clearState());
            setIsAlertVisible(false);
        }, waitTime);

        return () => clearTimeout(timer);
    }, [dispatch, waitTime]);

    // Alert type CSS class mapping
    const typeClass =
        {
            success: "usa-alert--success",
            warning: "usa-alert--warning",
            error: "usa-alert--error"
        }[type] || "";

    return isAlertVisible ? (
        <>
            {isFromRedirect && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        zIndex: 999
                    }}
                />
            )}
            <div
                className={`grid-container usa-alert ${typeClass} margin-top-0 pin-x z-top`}
                role="status"
                data-cy="alert"
            >
                <div className="usa-alert__body display-flex flex-justify">
                    <div>
                        <h1 className="usa-alert__heading">{heading}</h1>
                        <p className="usa-alert__text">{message}</p>
                        {children}
                    </div>
                    <FontAwesomeIcon
                        icon={faClose}
                        className="height-2 width-2 margin-right-1 cursor-pointer usa-tooltip"
                        title="close"
                        data-position="top"
                        data-cy="close-alert"
                        onClick={() => {
                            dispatch(setIsActive(false));
                            setIsAlertVisible(false);
                        }}
                    />
                </div>
            </div>
        </>
    ) : null;
};

export default Alert;
