import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Link, Navigate } from "react-router-dom";
import store from "./store";

//  USWDS
import "./uswds/css/styles.css";
import "./uswds/js/uswds.min.js";

import Home from "./pages/Home";
import PortfolioList from "./pages/portfolios/list/PortfolioList";
import PortfolioDetail from "./pages/portfolios/detail/PortfolioDetail";
import CanList from "./pages/cans/list/CanList";
import CanDetail from "./pages/cans/detail/CanDetail";
import UserDetail from "./pages/users/detail/UserDetail";
import EditUser from "./pages/users/edit/EditUser";
import ResearchProjects from "./components/Portfolios/ResearchProjects/ResearchProjects";
import PeopleAndTeams from "./components/Portfolios/PeopleAndTeams/PeopleAndTeams";
import BudgetAndFunding from "./components/Portfolios/BudgetAndFunding/BudgetAndFunding";
import ResearchProjectDetail from "./pages/researchProjects/detail/ResearchProjectDetail";
import CreateBudgetLines from "./pages/budgetLines";
import CreateAgreements from "./pages/agreements";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute/ProtectedRoute";
import { CreateProject } from "./pages/projects/CreateProject";
import { AgreementsList } from "./pages/agreements/list/AgreementsList";
import EditAgreement from "./pages/agreements/EditAgreement";
import { ApproveAgreement } from "./pages/agreements/approve/ApproveAgreement";
import Login from "./pages/Login";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route
                element={
                    // This demonstrates a Protected Route. All children within this Route
                    // will have to be processed by the Protection rules before rendering.
                    // By default, we redirect back to "/login" if they're not allowed. This can
                    // overwritten with a 'redirectPath="/whatever"' prop.
                    //
                    // In this example, all /portfolio routes are currently protected.

                    <ProtectedRoute />
                }
            >
                {/* BEGIN PROTECTED ROUTES */}
                <Route path="/portfolios" element={<PortfolioList />} />
                <Route
                    path="/portfolios/:id"
                    element={<PortfolioDetail />}
                    handle={{
                        // you can put whatever you want on a route handle
                        // here we use "crumb" and return some elements,
                        // this is what we'll render in the breadcrumbs
                        // for this route
                        crumb: () => (
                            <Link to="/portfolios" className="text-primary">
                                Portfolios
                            </Link>
                        ),
                    }}
                >
                    {/* Default to BudgetAndFunding */}
                    <Route exact path="" element={<Navigate to={"budget-and-funding"} />} />
                    <Route path="budget-and-funding" element={<BudgetAndFunding />} />
                    <Route path="research-projects" element={<ResearchProjects />} />
                    <Route path="people-and-teams" element={<PeopleAndTeams />} />
                </Route>
                <Route
                    path="/research-projects/:id"
                    element={<ResearchProjectDetail />}
                    handle={{
                        crumb: () => (
                            <div>
                                <Link to="/" className="text-primary">
                                    Research Projects
                                </Link>
                            </div>
                        ),
                    }}
                />
                <Route
                    path="/users/:id"
                    element={<UserDetail />}
                    handle={{
                        crumb: () => (
                            <div>
                                <Link to="/" className="text-primary">
                                    Users
                                </Link>
                            </div>
                        ),
                    }}
                />
                <Route
                    path="/users/edit/:id"
                    element={<EditUser />}
                    handle={{
                        crumb: () => (
                            <div>
                                <Link to="/" className="text-primary">
                                    Edit User
                                </Link>
                            </div>
                        ),
                    }}
                />
                <Route
                    path="/cans/:id"
                    element={<CanDetail />}
                    handle={{
                        crumb: () => (
                            <Link to="/cans" className="text-primary">
                                Cans
                            </Link>
                        ),
                    }}
                />
                <Route path="/budget-lines/create" element={<CreateBudgetLines />} />
                <Route path="/agreements/create" element={<CreateAgreements />} />
                <Route path="/projects/create" element={<CreateProject />} />
                <Route path="/agreements/" element={<AgreementsList />} />
                <Route path="/agreements/edit/:id" element={<EditAgreement />} />
                <Route path="/agreements/approve/:id" element={<ApproveAgreement />} />
                <Route path="/cans" element={<CanList />} />
            </Route>
        </>
    )
);

const rootElement = document.getElementById("root");

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </React.StrictMode>
    );
} else {
    console.error("No root element found");
}

// Expose redux store when running in Cypress (e2e)
if (window.Cypress) {
    window.store = store;
}
