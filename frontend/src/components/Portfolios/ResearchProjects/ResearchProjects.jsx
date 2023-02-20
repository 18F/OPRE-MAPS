import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// eslint-disable-next-line import/named
import { setResearchProjects } from "../../../pages/portfolios/detail/portfolioSlice";
import { Link, useParams } from "react-router-dom";
// eslint-disable-next-line import/named
import { getResearchProjects } from "../../../pages/portfolios/detail/getResearchProjects";

const ResearchProjects = () => {
    const dispatch = useDispatch();
    const urlPathParams = useParams();
    const portfolio = useSelector((state) => state.portfolioBudgetSummary.portfolio);
    const fiscalYear = useSelector((state) => state.portfolio.selectedFiscalYear);
    const portfolioId = parseInt(urlPathParams.id);
    const researchProjects = useSelector((state) => state.portfolio.researchProjects);

    const researchProjectData = researchProjects.map((rp) => (
        <li key={rp.id}>
            <Link to={`/research-projects/${rp.id}`}>{rp.title}</Link>
        </li>
    ));

    // Get ResearchProject data
    useEffect(() => {
        const getResearchProjectsAndSetState = async () => {
            const result = await getResearchProjects(portfolioId, fiscalYear.value);
            dispatch(setResearchProjects(result));
        };

        getResearchProjectsAndSetState().catch(console.error);

        return () => {
            dispatch(setResearchProjects([]));
        };
    }, [dispatch, fiscalYear, portfolioId]);

    return (
        <section>
            <h2 className="font-sans-lg">Projects & Spending Summary</h2>
            <p className="font-sans-sm">
                The summary below displays all active projects, spending and agreements within this portfolio for the
                selected fiscal year. An active project has active work happening. It might have funding from a previous
                fiscal year or no funding within the fiscal year.
            </p>
            {/* <pre>{JSON.stringify(researchProjects, null, 2)}</pre> */}
            {researchProjects.length > 0 && <ul>{researchProjectData}</ul>}
            {!researchProjectData && <p>There are no Research Projects.</p>}
        </section>
    );
};

export default ResearchProjects;
