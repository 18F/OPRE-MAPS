import styles from "./UserInfo.module.css";
import RoundedBox from "../../UI/RoundedBox/RoundedBox";
import { useSelector } from "react-redux";

const UserInfo = () => {
    const user = useSelector((state) => state.userDetail.user);

    return (
        <div className={styles.container}>
            <h1>User Details:</h1>
            <RoundedBox>
                <div className="cardBody">
                    <table>
                        <tbody>
                            <tr>
                                <td>User ID</td>
                                <td>: {user?.id}</td>
                            </tr>
                            <tr>
                                <td>OIDC</td>
                                <td>: {user?.oidc_id}</td>
                            </tr>
                            <tr>
                                <td>User Email</td>
                                <td>: {user?.email}</td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>
                                    : {user?.first_name} {user?.last_name}
                                </td>
                            </tr>
                            <tr>
                                <td>Date Joined</td>
                                <td>: {user?.date_joined}</td>
                            </tr>
                            <tr>
                                <td>Role(s)</td>
                                <td>: {user?.roles}</td>
                            </tr>
                            <tr>
                                <td>Division(s)</td>
                                <td>: {user?.division}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </RoundedBox>
        </div>
    );
};

export default UserInfo;
