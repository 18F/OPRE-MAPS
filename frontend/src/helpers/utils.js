export const getCurrentFiscalYear = (today) => {
    const currentMonth = today.getMonth();

    let fiscalYear;
    currentMonth < 9
        ? (fiscalYear = today.getFullYear().toString())
        : (fiscalYear = (today.getFullYear() + 1).toString());

    return fiscalYear;
};

export const calculatePercent = (numerator, denominator) => {
    if (denominator === "0" || denominator === 0) return "0";

    return Math.round((numerator / denominator) * 100);
};

export const formatDate = (date) => {
    const options = { timeZone: "UTC" };

    return date.toLocaleDateString("en-US", options);
};

/**
 * Object containing display text for various codes.
 * @typedef {Object} CodesToDisplayText
 * @property {Object.<string, string>} agreementType - Display text for agreement types.
 * @property {Object.<string, string>} agreementReason - Display text for agreement reasons.
 * @property {Object.<string, string>} budgetLineStatus - Display text for budget line types.
 * @property {Object.<string, string>} validation - Display text for validation errors.
 */

/**
 * Object containing display text for various codes.
 * @type {CodesToDisplayText}
 */
const codesToDisplayText = {
    agreementType: {
        CONTRACT: "Contract",
        GRANT: "Grant",
        DIRECT_ALLOCATION: "Direct Allocation",
        IAA: "IAA",
        MISCELLANEOUS: "Misc",
    },
    agreementReason: {
        NEW_REQ: "New Requirement",
        RECOMPETE: "Recompete",
        LOGICAL_FOLLOW_ON: "Logical Follow On",
    },
    budgetLineStatus: {
        DRAFT: "Draft",
        UNDER_REVIEW: "In Review",
        PLANNED: "Planned",
        IN_EXECUTION: "Executing",
        OBLIGATED: "Obligated",
    },
    validation: {
        name: "Name",
        type: "Type",
        description: "Description",
        psc: "Product Service Code",
        naics: "NAICS Code",
        "program-support-code": "Program Support Code",
        "procurement-shop": "Procurement Shop",
        reason: "Reason for creating the agreement",
        incumbent: "Incumbent",
        "project-officer": "Project Officer",
        "team-member": "Team Members",
        "budget-line-items": "Budget Line Items",
    },
};

/**
 * Converts a code value into a display text value based on a predefined mapping.
 * @param {("agreementType" | "agreementReason" | "budgetLineStatus" | "validation")} listName - The name of the list to retrieve the mapping from the codesToDisplayText object. This parameter is required.
 * @param {string} code - The code value to convert. This parameter is required.
 * @returns {string} The display text value for the code, or the original code value if no mapping is found.
 * @throws {Error} If either the listName or code parameter is not provided.
 * @example convertCodeForDisplay("agreementReason", reason)
 * @example convertCodeForDisplay("budgetLineStatus", budgetLineStatus)
 * @example convertCodeForDisplay("validation", "name")
 */
export const convertCodeForDisplay = (listName, code) => {
    if (!codesToDisplayText[listName]) {
        throw new Error("Invalid list name");
    }

    // Retrieve the mapping for the list name
    const codeMap = codesToDisplayText[listName];

    // Return the display text for the code, or the original code value if no mapping is found
    return codeMap[code] ? codeMap[code] : code;
};

export const loggedInName = (activeUser) => {
    let loggedInUser = "Unknown User";
    if (activeUser) {
        loggedInUser = activeUser.full_name ? activeUser.full_name : activeUser.email;
    }
    return loggedInUser;
};

export const timeAgo = (dateParam) => {
    if (!dateParam) {
        return null;
    }
    // if there's no timezone info, assume it UTC and missing the "Z"
    if (typeof dateParam === "string" || dateParam instanceof String) {
        if (!dateParam.endsWith("Z") && !dateParam.includes("+")) {
            dateParam = dateParam + "Z";
        }
    }
    console.log("dateParam:", dateParam);

    const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);

    console.log(`seconds: ${seconds}`);

    if (seconds < 5) {
        return "now";
    } else if (seconds < 60) {
        return `${seconds} seconds ago`;
    } else if (seconds < 90) {
        return "about a minute ago";
    } else if (minutes < 60) {
        return `${minutes} minutes ago`;
    }

    return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

/**
 * Find the fiscal year for a date, which is the same as it's year unless it's after
 * September 30th then it rolls over into the next FY.
 * @param date - a date as string such as "2023-02-15" or a Date
 * @returns {number|null} the fiscal year
 */
export const fiscalYearFromDate = (date) => {
    if (date === "--" || date === null) return null;
    if (!date) return null;
    let dt = new Date(date);
    const month = dt.getUTCMonth();
    const year = dt.getUTCFullYear();
    return month > 8 ? year + 1 : year;
};
