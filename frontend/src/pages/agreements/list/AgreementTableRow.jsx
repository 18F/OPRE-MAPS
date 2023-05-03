import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CurrencyFormat from "react-currency-format";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faClock } from "@fortawesome/free-regular-svg-icons";
import Tag from "../../../components/UI/Tag/Tag";
import "./AgreementsList.scss";
import { getUser } from "../../../api/getUser";
import icons from "../../../uswds/img/sprite.svg";
import { formatDate } from "../../../helpers/utils";

export const AgreementTableRow = ({ agreement }) => {
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRowActive, setIsRowActive] = useState(false);

    const agreementName = agreement?.name;
    const researchProjectName = agreement?.research_project?.title;

    let agreementType;
    switch (agreement?.agreement_type) {
        case "CONTRACT":
            agreementType = "Contract";
            break;
        case "GRANT":
            agreementType = "Grant";
            break;
        case "DIRECT_ALLOCATION":
            agreementType = "Direct Allocation";
            break;
        case "IAA":
            agreementType = "IAA";
            break;
        case "MISCELLANEOUS":
            agreementType = "Misc";
            break;
        default:
            agreementType = "Unknown Type";
    }

    const agreementSubTotal = agreement?.budget_line_items?.reduce((n, { amount }) => n + amount, 0);
    const procurementShopSubTotal = agreement?.budget_line_items?.reduce(
        (n, { amount }) => n + amount * (agreement.procurement_shop ? agreement.procurement_shop.fee : 0),
        0
    );
    const agreementTotal = agreementSubTotal + procurementShopSubTotal;

    // find the min(date_needed) of the BLIs
    let nextNeedBy = agreement?.budget_line_items?.reduce(
        (n, { date_needed }) => (n < date_needed ? n : date_needed),
        0
    );

    nextNeedBy = nextNeedBy ? formatDate(new Date(nextNeedBy)) : "";

    // if there is 1 BLI with status === "UNDER_REVIEW" then agreement status is "UNDER_REVIEW"
    // else it is "DRAFT"
    const agreementStatus = agreement?.budget_line_items?.find((bli) => bli.status === "UNDER_REVIEW")
        ? "In Review"
        : "Draft";

    useEffect(() => {
        const getUserAndSetState = async (id) => {
            const results = await getUser(id);
            setUser(results);
        };

        if (agreement?.created_by) {
            getUserAndSetState(agreement?.created_by).catch(console.error);
        } else {
            setUser({ full_name: "Sheila Celentano" });
        }

        return () => {
            setUser({});
        };
    }, [agreement]);

    const agreementCreatedBy = user?.full_name;

    const agreementNotes = agreement?.notes;

    const formatted_today = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const agreementCreatedOn = agreement?.created_on
        ? new Date(agreement.created_on).toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : formatted_today;

    const handleExpandRow = () => {
        setIsExpanded(!isExpanded);
        setIsRowActive(true);
    };

    const handleEditAgreement = (event) => {};
    const handleDeleteAgreement = (event) => {};
    const handleSubmitAgreementForApproval = (event) => {
        navigate(`/agreements/approve/${event}`);
    };

    const TableTag = ({ status }) => {
        let classNames = "padding-x-105 padding-y-1 ";
        switch (status) {
            case "Draft":
                classNames += "bg-brand-neutral-lighter";
                break;
            case "In Review":
                classNames += "underReview";
                break;
            default:
        }
        return <Tag className={classNames} text={status} />;
    };

    const ChangeIcons = ({ agreement, status }) => {
        return (
            <>
                {(status === "Draft" || status === "In Review") && (
                    <>
                        <FontAwesomeIcon
                            icon={faPen}
                            className="text-primary height-2 width-2 margin-right-1 hover: cursor-pointer usa-tooltip"
                            title="edit"
                            data-position="top"
                            onClick={() => handleEditAgreement(agreement.id)}
                        />
                        <FontAwesomeIcon
                            icon={faTrash}
                            title="delete"
                            data-position="top"
                            className="text-primary height-2 width-2 margin-right-1 hover: cursor-pointer usa-tooltip"
                            onClick={() => handleDeleteAgreement(agreement.id)}
                        />
                        <svg
                            className="usa-icon text-primary height-2 width-2 hover: cursor-pointer usa-tooltip"
                            title="submit for approval"
                            data-position="top"
                            onClick={() => handleSubmitAgreementForApproval(agreement.id)}
                        >
                            <use xlinkHref={`${icons}#send`}></use>
                        </svg>
                    </>
                )}
            </>
        );
    };
    return (
        <Fragment key={agreement?.id}>
            <tr onMouseEnter={() => setIsRowActive(true)} onMouseLeave={() => !isExpanded && setIsRowActive(false)}>
                <th scope="row" style={{ backgroundColor: isRowActive && "#F0F0F0" }}>
                    {agreementName}
                </th>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>{researchProjectName}</td>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>{agreementType || ""}</td>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>
                    <CurrencyFormat
                        value={agreementTotal}
                        displayType={"text"}
                        thousandSeparator={true}
                        prefix={"$"}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        renderText={(value) => value}
                    />
                </td>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>{nextNeedBy}</td>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>
                    {isRowActive && !isExpanded ? (
                        <div>
                            <ChangeIcons agreement={agreement} status={agreementStatus} />
                        </div>
                    ) : (
                        <TableTag status={agreementStatus} />
                    )}
                </td>
                <td style={{ backgroundColor: isRowActive && "#F0F0F0" }}>
                    <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className="height-2 width-2 padding-right-1 hover: cursor-pointer"
                        onClick={() => handleExpandRow()}
                    />
                </td>
            </tr>

            {isExpanded && (
                <tr className="border-top-0">
                    <td colSpan="9" style={{ backgroundColor: "#F0F0F0" }}>
                        <div className="display-flex padding-right-9">
                            <dl className="font-12px">
                                <dt className="margin-0 text-base-dark">Created By</dt>
                                <dd className="margin-0">{agreementCreatedBy}</dd>
                                <dt className="margin-0 text-base-dark display-flex flex-align-center margin-top-2">
                                    <FontAwesomeIcon icon={faClock} className="height-2 width-2 margin-right-1" />
                                    {agreementCreatedOn}
                                </dt>
                            </dl>
                            <dl className="font-12px" style={{ marginLeft: "9.0625rem" }}>
                                <dt className="margin-0 text-base-dark">Notes</dt>
                                <dd className="margin-0" style={{ maxWidth: "400px" }}>
                                    {agreementNotes ? agreementNotes : "No notes added."}
                                </dd>
                            </dl>
                            <div className="flex-align-self-end margin-left-auto margin-bottom-1">
                                <ChangeIcons agreement={agreement} status={agreementStatus} />
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </Fragment>
    );
};
