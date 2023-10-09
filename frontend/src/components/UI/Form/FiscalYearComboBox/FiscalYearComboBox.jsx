import PropTypes from "prop-types";
import ComboBox from "../ComboBox";

/**
 *  A comboBox for choosing a project.
 * @param {Object} props - The component props.
 * @param {Array<any>} props.selectedFiscalYears - The currently selected fiscal years.
 * @param {Function} props.setSelectedFiscalYears - A function to call when the selected fiscal year changes.
 * @param {string} [props.legendClassname] - Additional CSS classes to apply to the label/legend (optional).
 * @param {string} [props.defaultString] - Initial text to display in select (optional).
 * @param {Object} [props.overrideStyles] - Some CSS styles to override the default (optional).
 * @param {Array<Number>} props.budgetLinesFiscalYears - An array of fiscal years to display
 * @returns {React.JSX.Element} - The rendered component.
 */
export const FiscalYearComboBox = ({
    selectedFiscalYears,
    setSelectedFiscalYears,
    legendClassname = "usa-label margin-top-0",
    defaultString = "",
    overrideStyles = {},
    budgetLinesFiscalYears = []
}) => {
    const fiscalYears = budgetLinesFiscalYears.map((fiscalYear) => {
        return { id: fiscalYear, title: fiscalYear };
    });

    return (
        <div className="display-flex flex-justify">
            <div>
                <label
                    className={legendClassname}
                    htmlFor="project-combobox-input"
                >
                    Fiscal Year
                </label>
                <div>
                    <ComboBox
                        namespace="fiscal-year-combobox"
                        data={fiscalYears}
                        selectedData={selectedFiscalYears}
                        setSelectedData={setSelectedFiscalYears}
                        defaultString={defaultString}
                        overrideStyles={overrideStyles}
                        isMulti={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default FiscalYearComboBox;

FiscalYearComboBox.propTypes = {
    selectedFiscalYears: PropTypes.array.isRequired,
    setSelectedFiscalYears: PropTypes.func.isRequired,
    legendClassname: PropTypes.string,
    defaultString: PropTypes.string,
    overrideStyles: PropTypes.object,
    budgetLinesFiscalYears: PropTypes.array.isRequired
};
