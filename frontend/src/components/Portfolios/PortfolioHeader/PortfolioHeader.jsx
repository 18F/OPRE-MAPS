import { useSelector } from "react-redux";

import style from "./styles.module.css";
import PortfolioTeamLeaders from "../PortfolioTeamLeaders/PortfolioTeamLeaders";
import PortfolioDescription from "../PortfolioDescription/PortfolioDescription";

const PortfolioHeader = () => {
    const portfolio = useSelector((state) => state.portfolio.portfolio);

    const sectionClasses = `padding-3 ${style.background}`;
    const divisionClasses = `font-sans-3xs ${style.division}`;

    return (
        <section className={sectionClasses}>
            <h1 className="font-sans-2xl margin-0">{portfolio.name}</h1>
            <h2 className={divisionClasses}>{portfolio.division?.name}</h2>
            <PortfolioTeamLeaders />
            <PortfolioDescription />
        </section>
    );
};

export default PortfolioHeader;
