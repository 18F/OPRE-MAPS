import { login, logout } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cryptoRandomString from "crypto-random-string";
import { getAuthorizationCode } from "./auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { User } from "../UI/Header/User";
import { apiLogin } from "../../api/apiLogin";
import NotificationCenter from "../UI/NotificationCenter/NotificationCenter";
import { setActiveUser } from "./auth";

// async function setActiveUser(token, dispatch) {
//     // TODO: Vefiry the Token!
//     //const isValidToken = validateTooken(token);
//     const decodedJwt = jwt_decode(token);
//     const userId = decodedJwt["sub"];
//     const userDetails = await getUserByOidc(userId);

//     dispatch(setUserDetails(userDetails));
// }

const AuthSection = () => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const activeUser = useSelector((state) => state.auth.activeUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const callBackend = useCallback(
        async (authCode) => {
            const response = await apiLogin(authCode);
            if (response.access_token) {
                localStorage.setItem("access_token", response.access_token);
                dispatch(login());
                if (!activeUser) await setActiveUser(response.access_token, dispatch);
                if (response.is_new_user) {
                    navigate("/user/edit");
                    return;
                }
            }
            navigate("/");
        },
        [dispatch, navigate]
    );

    useEffect(() => {
        const currentJWT = localStorage.getItem("access_token");

        if (currentJWT) {
            // TODO: we should validate the JWT here and set it on state if valid else logout
            dispatch(login());
            if (!activeUser) setActiveUser(currentJWT, dispatch);
            return;
        } else {
            navigate("/login");
        }

        const localStateString = localStorage.getItem("ops-state-key");

        if (localStateString) {
            const queryParams = new URLSearchParams(window.location.search);

            // check if we have been redirected here from the OIDC provider
            if (queryParams.has("state") && queryParams.has("code")) {
                // check that the state matches
                const returnedState = queryParams.get("state");
                const localStateString = localStorage.getItem("ops-state-key");

                localStorage.removeItem("ops-state-key");

                if (localStateString !== returnedState) {
                    throw new Error("Response from OIDC provider is invalid.");
                } else {
                    const authCode = queryParams.get("code");
                    console.log(`Received Authentication Code = ${authCode}`);
                    callBackend(authCode).catch(console.error);
                }
            }
        } else {
            // first page load - generate state token and set on localStorage
            localStorage.setItem("ops-state-key", cryptoRandomString({ length: 64 }));
        }
    }, [callBackend, dispatch, navigate]);

    const logoutHandler = async () => {
        dispatch(logout());
        localStorage.removeItem("access_token");
        //await apiLogout();
        navigate("/login");
        // TODO: ⬇ Logout from Auth Provider ⬇
        // const output = await logoutUser(localStorage.getItem("ops-state-key"));
        // console.log(output);
        // TODO: Add the current access_token's 'jti' to a revocation list, to prevent replay attacks
    };

    return (
        <div>
            {!isLoggedIn && (
                <div>
                    <button
                        className="usa-button fa-solid fa-arrow-right-to-bracket margin-1"
                        onClick={() =>
                            (window.location.href = getAuthorizationCode(localStorage.getItem("ops-state-key")))
                        }
                    >
                        <span className="margin-1">Sign-in</span>
                        <FontAwesomeIcon icon={solid("arrow-right-to-bracket")} />
                    </button>
                </div>
            )}
            {isLoggedIn && (
                <div>
                    <div className="display-flex flex-align-center">
                        <div className="padding-right-1">
                            <User />
                        </div>
                        <div className="padding-right-205">
                            <NotificationCenter />
                        </div>
                        <button
                            className="usa-button fa-solid fa-arrow-right-to-bracket margin-1"
                            onClick={logoutHandler}
                        >
                            <span className="margin-1">Sign-out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthSection;
