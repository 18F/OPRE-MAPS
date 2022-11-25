from flask import Blueprint
from ops.can import views

bp_cans = Blueprint(
    "cans",
    __name__,
    url_prefix="/ops/cans",
)

bp_cans.add_url_rule("/", view_func=views.all_cans)
bp_cans.add_url_rule("/<int:pk>", view_func=views.load_can)
bp_cans.add_url_rule("/portfolio/<int:portfolio_id>", view_func=views.get_portfolio_cans)

bp_can_fiscal_year = Blueprint(
    "canFiscalYear", __name__, url_prefix="/ops/can-fiscal-year"
)
bp_can_fiscal_year.add_url_rule("/", view_func=views.all_can_fiscal_years)
bp_can_fiscal_year.add_url_rule(
    "/<int:can_id>/<int:year>", view_func=views.get_can_fiscal_year
)

bp_budget_line_item = Blueprint(
    "budgetLineItem", __name__, url_prefix="/ops/budget-line-items"
)
bp_budget_line_item.add_url_rule("/", view_func=views.all_budget_line_items)
bp_budget_line_item.add_url_rule(
    "/<int:can_id>/<int:fiscal_year>",
    view_func=views.get_budget_line_items_by_can_and_fiscal_year,
)
