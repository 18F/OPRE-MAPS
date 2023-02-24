from flask import Blueprint
from ops_api.ops.views import (
    AUTH_LOGIN_API_VIEW_FUNC,
    AUTH_REFRESH_API_VIEW_FUNC,
    BUDGET_LINE_ITEMS_ITEM_API_VIEW_FUNC,
    BUDGET_LINE_ITEMS_LIST_API_VIEW_FUNC,
    CAN_FISCAL_YEAR_ITEM_API_VIEW_FUNC,
    CAN_FISCAL_YEAR_LIST_API_VIEW_FUNC,
    CAN_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC,
    CAN_ITEM_API_VIEW_FUNC,
    CAN_LIST_API_VIEW_FUNC,
    CANS_BY_PORTFOLIO_API_VIEW_FUNC,
    DIVISIONS_ITEM_API_VIEW_FUNC,
    DIVISIONS_LIST_API_VIEW_FUNC,
    PORTFOLIO_CALCULATE_FUNDING_API_VIEW_FUNC,
    PORTFOLIO_CANS_API_VIEW_FUNC,
    PORTFOLIO_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC,
    PORTFOLIO_ITEM_API_VIEW_FUNC,
    PORTFOLIO_LIST_API_VIEW_FUNC,
    PORTFOLIO_STATUS_ITEM_API_VIEW_FUNC,
    PORTFOLIO_STATUS_LIST_API_VIEW_FUNC,
    RESEARCH_PROJECT_ITEM_API_VIEW_FUNC,
    RESEARCH_PROJECT_LIST_API_VIEW_FUNC,
    USERS_ITEM_API_VIEW_FUNC,
    USERS_LIST_API_VIEW_FUNC,
)

# Ideas from Flask docs: https://flask.palletsprojects.com/en/2.2.x/views/#method-dispatching-and-apis


def register_api(api_bp: Blueprint) -> None:
    api_bp.add_url_rule(
        "/auth/login/",
        view_func=AUTH_LOGIN_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/auth/refresh/",
        view_func=AUTH_REFRESH_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/portfolios/<int:id>/calcFunding/",
        view_func=PORTFOLIO_CALCULATE_FUNDING_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/portfolios/<int:id>/cans/",
        view_func=PORTFOLIO_CANS_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/portfolios/<int:id>",
        view_func=PORTFOLIO_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/portfolios/",
        view_func=PORTFOLIO_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/cans/<int:id>",
        view_func=CAN_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/cans/",
        view_func=CAN_LIST_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/cans/portfolio/<int:id>",
        view_func=CANS_BY_PORTFOLIO_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/can-fiscal-year/<int:id>",
        view_func=CAN_FISCAL_YEAR_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/can-fiscal-year/",
        view_func=CAN_FISCAL_YEAR_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/budget-line-items/<int:id>",
        view_func=BUDGET_LINE_ITEMS_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/budget-line-items/",
        view_func=BUDGET_LINE_ITEMS_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/portfolio-status/<int:id>",
        view_func=PORTFOLIO_STATUS_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/portfolio-status/",
        view_func=PORTFOLIO_STATUS_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/divisions/<int:id>",
        view_func=DIVISIONS_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/divisions/",
        view_func=DIVISIONS_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/users/<int:id>",
        view_func=USERS_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/users/",
        view_func=USERS_LIST_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/can-funding-summary/<int:id>",
        view_func=CAN_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/portfolio-funding-summary/<int:id>",
        view_func=PORTFOLIO_FUNDING_SUMMARY_ITEM_API_VIEW_FUNC,
    )

    api_bp.add_url_rule(
        "/research-projects/<int:id>",
        view_func=RESEARCH_PROJECT_ITEM_API_VIEW_FUNC,
    )
    api_bp.add_url_rule(
        "/research-projects/",
        view_func=RESEARCH_PROJECT_LIST_API_VIEW_FUNC,
    )
