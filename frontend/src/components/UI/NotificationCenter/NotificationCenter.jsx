import { useGetNotificationsByUserIdQuery } from "../../../api/opsAPI";
import jwt_decode from "jwt-decode";
import icons from "../../../uswds/img/sprite.svg";
import Modal from "react-modal";
import React from "react";
import Notification from "../Notification";
import customStyles from "./NotificationCenter.module.css";

const NotificationCenter = () => {
    const [showModal, setShowModal] = React.useState(false);
    const currentJWT = localStorage.getItem("access_token");
    let userId = "";

    if (currentJWT) {
        const decodedJwt = jwt_decode(currentJWT);
        userId = decodedJwt["sub"];
    }

    const { data, error, isLoading } = useGetNotificationsByUserIdQuery(userId, { pollingInterval: 5000 });

    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Oops, an error occurred</div>;
    }

    Modal.setAppElement("#root");

    return (
        <>
            <svg
                className="usa-icon text-primary height-205 width-205 hover: cursor-pointer usa-tooltip"
                onClick={() => setShowModal(true)}
                id="notification-center-bell"
            >
                <use xlinkHref={`${icons}#notifications`}></use>
            </svg>

            <Modal
                isOpen={showModal}
                onRequestClose={() => setShowModal(false)}
                className={customStyles.Modal}
                overlayClassName={customStyles.Overlay}
                contentLabel="Notifications"
            >
                <div className={customStyles.flexContainer}>
                    <div className={customStyles.flexLeft}></div>

                    <div className={customStyles.flexRight}>
                        <h2>Hello</h2>
                        <button onClick={() => setShowModal(false)}>close</button>
                        <div>I am a modal</div>
                        <ul>
                            {data.map((item) => (
                                <Notification key={item.id} data={item} />
                            ))}
                        </ul>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default NotificationCenter;
