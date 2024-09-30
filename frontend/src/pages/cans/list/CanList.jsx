import _ from "lodash";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useGetCansQuery } from "../../../api/opsAPI";
import App from "../../../App";
import CANTable from "../../../components/CANs/CANTable";
import CANTags from "../../../components/CANs/CanTabs";
import TablePageLayout from "../../../components/Layouts/TablePageLayout";
import ErrorPage from "../../ErrorPage";

/**
 * Page for the CAN List.
 * @component
 * @typedef {import("../../../components/CANs/CANTypes").CAN} CAN
 * @returns {JSX.Element | boolean} - The component JSX.
 */
const CanList = () => {
    const [searchParams] = useSearchParams();
    const myCANsUrl = searchParams.get("filter") === "my-cans";
    const { data: canList, isError, isLoading } = useGetCansQuery({});
    const activeUser = useSelector((state) => state.auth.activeUser);
    // SORTS
    let sortedCANs = [];
    /**
     * Sorts an array of CANs by obligateBy date in descending order.
     * @param {CAN[]} cans - The array of CANs to sort.
     * @returns {CAN[]} The sorted array of CANs.
     */
    const sortCANs = (cans) => {
        return cans.sort((a, b) => {
            return new Date(b.obligate_by) - new Date(a.obligate_by);
        });
    };
    // FILTERS
    let filteredCANs = _.cloneDeep(canList ?? []);
    if (myCANsUrl) {
        const myCANs = filteredCANs.filter((can) => {
            return can.team_members?.some((teamMember) => {
                return teamMember.id === activeUser.id || can.project_officer_id === activeUser.id;
            });
        });
        sortedCANs = sortCANs(myCANs);
    } else {
        // all CANs
        sortedCANs = sortCANs(filteredCANs);
    }
    if (isLoading) {
        return (
            <App>
                <h1>Loading...</h1>
            </App>
        );
    }
    if (isError) {
        return <ErrorPage />;
    }
    // TODO: remove flag once CANS are ready
    return (
        import.meta.env.DEV && (
            <App breadCrumbName="CANs">
                <TablePageLayout
                    title="CANs"
                    subtitle={myCANsUrl ? "My CANs" : "All CANs"}
                    details={
                        myCANsUrl
                            ? "This is a list of CANs from agreements you are listed as a team member on. Please select filter options to see CANs by Portfolio, Fiscal Year, or other criteria."
                            : "This is a list of all CANs across OPRE that are or were active within the selected Fiscal Year."
                    }
                    TabsSection={<CANTags />}
                    TableSection={<CANTable cans={sortedCANs} />}
                />
            </App>
        )
    );
};

export default CanList;
