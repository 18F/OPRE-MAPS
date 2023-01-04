import styles from "./TabsSection.module.css";
import { Link, useLocation } from "react-router-dom";
import React from "react";

const TabsSection = ({ portfolioId }) => {
    const location = useLocation();

    const selected = `font-sans-2xs ${styles.listItemSelected}`;

    const notSelected = `font-sans-2xs ${styles.listItemNotSelected}`;

    const paths = [
        {
            name: "/budget-and-funding",
            label: "Budget And Funding",
        },
        {
            name: "/research-projects",
            label: "Research Projects",
        },
        {
            name: "/people-and-teams",
            label: "People and Teams",
        },
    ];

    const links = paths.map((path) => {
        const pathName = `/portfolios/${portfolioId}${path.name}`;

        return (
            <Link to={pathName} className={location.pathname === pathName ? selected : notSelected} key={pathName}>
                {path.label}
            </Link>
        );
    });

    return (
        <>
            <nav className={styles.tabsList} aria-label={"Portfolio Tab Sections"} role={"navigation"}>
                {links}
            </nav>
        </>
    );
};

export default TabsSection;
