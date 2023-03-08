from decimal import Decimal
from typing import Any, Optional, TypedDict

from models.cans import CAN, BudgetLineItem, BudgetLineItemStatus, CANFiscalYear, CANFiscalYearCarryOver
from models.portfolios import Portfolio
from ops_api.ops import db
from sqlalchemy import Select, and_, select, sql
from sqlalchemy.sql.functions import coalesce


class FundingLineItem(TypedDict):
    """Dict type hint for line items in total funding."""

    amount: float
    label: str


class TotalFunding(TypedDict):
    """Dict type hint for total finding"""

    total_funding: FundingLineItem
    planned_funding: FundingLineItem
    obligated_funding: FundingLineItem
    in_execution_funding: FundingLineItem
    available_funding: FundingLineItem


def _get_total_fiscal_year_funding(portfolio_id: int, fiscal_year: int) -> Decimal:
    stmt = (
        select(coalesce(sql.functions.sum(CANFiscalYear.total_fiscal_year_funding), 0))
        .join(CAN)
        .where(CAN.managing_portfolio_id == portfolio_id)
        .where(CANFiscalYear.fiscal_year == fiscal_year)
    )

    return db.session.execute(stmt).scalar()


def _get_carry_forward_total(portfolio_id: int, fiscal_year: int) -> Decimal:
    stmt = (
        select(coalesce(sql.functions.sum(CANFiscalYearCarryOver.amount), 0))
        .join(CAN)
        .where(CAN.managing_portfolio_id == portfolio_id)
        .where(CANFiscalYearCarryOver.to_fiscal_year == fiscal_year)
    )

    return db.session.execute(stmt).scalar()


def _get_budget_line_item_total_by_status(portfolio_id: int, fiscal_year: int, status: str) -> Decimal:
    stmt = _get_budget_line_item_total(portfolio_id, fiscal_year)
    stmt = stmt.where(BudgetLineItemStatus.status == status)

    return db.session.execute(stmt).scalar()


def _get_budget_line_item_total(portfolio_id: int, fiscal_year: int) -> Select[Any]:
    stmt = (
        select(coalesce(sql.functions.sum(BudgetLineItem.amount), 0))
        .join(
            CANFiscalYear,
            and_(
                BudgetLineItem.can_fiscal_year_can_id == CANFiscalYear.can_id,
                BudgetLineItem.can_fiscal_year_fiscal_year == CANFiscalYear.fiscal_year,
            ),
        )
        .join(CAN)
        .join(BudgetLineItemStatus)
        .where(CAN.managing_portfolio_id == portfolio_id)
        .where(CANFiscalYear.fiscal_year == fiscal_year)
    )

    return stmt


def get_total_funding(portfolio: Portfolio, fiscal_year: Optional[int] = None) -> TotalFunding:
    total_funding = _get_total_fiscal_year_funding(portfolio_id=portfolio.id, fiscal_year=fiscal_year)

    carry_over_funding = _get_carry_forward_total(portfolio_id=portfolio.id, fiscal_year=fiscal_year)

    planned_funding = _get_budget_line_item_total_by_status(
        portfolio_id=portfolio.id, fiscal_year=fiscal_year, status="Planned"
    )

    obligated_funding = _get_budget_line_item_total_by_status(
        portfolio_id=portfolio.id, fiscal_year=fiscal_year, status="Obligated"
    )

    in_execution_funding = _get_budget_line_item_total_by_status(
        portfolio_id=portfolio.id, fiscal_year=fiscal_year, status="In Execution"
    )

    total_accounted_for = sum(
        (
            planned_funding,
            obligated_funding,
            in_execution_funding,
        )
    )

    available_funding = float(total_funding) - float(total_accounted_for)

    return {
        "total_funding": {
            "amount": float(total_funding),
            "percent": "Total",
        },
        "carry_over_funding": {
            "amount": float(carry_over_funding),
            "percent": "Carry Over",
        },
        "planned_funding": {
            "amount": float(planned_funding),
            "percent": get_percentage(total_funding, planned_funding),
        },
        "obligated_funding": {
            "amount": float(obligated_funding),
            "percent": get_percentage(total_funding, obligated_funding),
        },
        "in_execution_funding": {
            "amount": float(in_execution_funding),
            "percent": get_percentage(total_funding, in_execution_funding),
        },
        "available_funding": {
            "amount": float(available_funding),
            "percent": get_percentage(total_funding, available_funding),
        },
    }


def get_percentage(total_funding: float, specific_funding: float) -> float:
    return 0 if total_funding == 0 else f"{round(float(specific_funding) / float(total_funding), 2) * 100}"
