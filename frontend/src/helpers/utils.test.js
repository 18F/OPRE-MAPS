/// <reference types="jest" />

import {getCurrentFiscalYear, calculatePercent, convertCodeForDisplay, fiscalYearFromDate} from "./utils";

test("current federal fiscal year is calculated correctly", async () => {
    const lastDay = new Date("September 30, 2022");
    const firstDay = new Date("October 1, 2022");

    expect(getCurrentFiscalYear(lastDay)).toEqual("2022");
    expect(getCurrentFiscalYear(firstDay)).toEqual("2023");
});

test("percent is calculated correctly", async () => {
    expect(calculatePercent(2, 4)).toEqual(50);
    expect(calculatePercent(3, 4)).toEqual(75);
    expect(calculatePercent(7, 4)).toEqual(175);
    expect(calculatePercent(0, 4)).toEqual(0);
});

test("codes are converted for display correctly", async () => {
    expect(() => convertCodeForDisplay("__foo__", "test_code")).toThrow("Invalid list name");
    expect(convertCodeForDisplay("agreementType", "__foo__")).toEqual("__foo__");
    expect(convertCodeForDisplay("agreementType", "GRANT")).toEqual("Grant");
    expect(convertCodeForDisplay("agreementReason", "NEW_REQ")).toEqual("New Requirement");
});

test("fiscal year are calculated correctly", async () => {
    expect(fiscalYearFromDate(null)).toEqual(null);
    expect(fiscalYearFromDate("--")).toEqual(null);
    expect(fiscalYearFromDate("2033-01-01")).toEqual(2033);
    expect(fiscalYearFromDate("2033-09-30")).toEqual(2033);
    expect(fiscalYearFromDate("2033-10-01")).toEqual(2034);
});