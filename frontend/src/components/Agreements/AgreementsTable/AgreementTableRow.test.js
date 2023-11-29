import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { AgreementTableRow } from "./AgreementTableRow";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { vi } from "vitest";

const history = createMemoryHistory();
const mockStore = configureStore([]);

vi.mock("react", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        useState: () => [null, vi.fn()]
    };
});

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

// This will reset all mocks after each test
afterEach(() => {
    vi.resetAllMocks();
});

const userData = {
    id: 1,
    full_name: "Test User"
};

vi.mock("../../../api/opsAPI", async () => {
    const actual = await vi.importActual("../../../api/opsAPI");

    return {
        ...actual,
        useGetUserByIdQuery: () => vi.fn(() => ({ data: userData })),
        useGetAgreementByIdQuery: () => vi.fn(() => ({ data: agreement }))
    };
});

const agreement = {
    id: 1,
    name: "Test Agreement",
    display_name: "Test Agreement",
    research_project: { title: "Test Project" },
    agreement_type: "GRANT",
    project_officer_id: 1,
    team_members: [{ id: 1 }],
    procurement_shop: { fee: 0.05 },

    budget_line_items: [
        { amount: 100, date_needed: "2024-05-02T11:00:00", status: "DRAFT" },
        { amount: 200, date_needed: "2023-03-02T11:00:00", status: "UNDER_REVIEW" },
        { amount: 300, date_needed: "2043-03-04T11:00:00", status: "PLANNED", proc_shop_fee_percentage: 0.05 }
    ],
    created_by: 1,
    notes: "Test notes",
    created_on: "2021-10-21T03:24:00",
    status: "In Review"
};
const initialState = {
    auth: {
        activeUser: {
            id: 1,
            name: "Test User"
        }
    },
    alert: {
        isActive: false
    }
};
const store = mockStore(initialState);
describe("AgreementTableRow", () => {
    test("renders correctly", () => {
        render(
            <Provider store={store}>
                <Router
                    location={history.location}
                    navigator={history}
                >
                    <table>
                        <tbody>
                            <AgreementTableRow agreement={agreement} />
                        </tbody>
                    </table>
                </Router>
            </Provider>
        );
        expect(screen.getByText("Test Agreement")).toBeInTheDocument();
        expect(screen.getByText("Test Project")).toBeInTheDocument();
        expect(screen.getByText("Grant")).toBeInTheDocument();
        expect(screen.getByText("$630.00")).toBeInTheDocument();
        expect(screen.getByText("$315.00")).toBeInTheDocument();
        expect(screen.getByText("3/4/2043")).toBeInTheDocument();
    });
});
