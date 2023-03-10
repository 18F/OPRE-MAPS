from decimal import Decimal

import pytest
from flask.testing import FlaskClient
from flask_sqlalchemy import SQLAlchemy
from models.cans import CAN
from ops_api.ops.utils.cans import get_can_funding_summary


@pytest.mark.usefixtures("app_ctx")
def test_get_can_funding_summary_no_fiscal_year(loaded_db: SQLAlchemy) -> None:
    can = loaded_db.session.get(CAN, 1)
    result = get_can_funding_summary(can)

    # Remove these because they are set according to when the test was run
    del result["can"]["created_on"]
    del result["can"]["updated_on"]

    assert result == {
        "available_funding": "-860000.00",
        "can": {
            "appropriation_date": None,
            "appropriation_term": 1,
            "arrangement_type": "OPRE_APPROPRIATION",
            "authorizer_id": 26,
            "created_by": None,
            "description": "Healthy Marriages Responsible Fatherhood - OPRE",
            "expiration_date": "01/09/2023",
            "id": 1,
            "managing_portfolio_id": 6,
            "managing_research_project_id": None,
            "nickname": "HMRF-OPRE",
            "number": "G99HRF2",
            "purpose": "",
        },
        "carry_forward_funding": 0,
        "carry_forward_label": "Carry-Forward",
        "received_funding": Decimal("880000.00"),
        "expected_funding": Decimal("260000.00"),
        "expiration_date": "09/01/2023",
        "in_execution_funding": Decimal("2000000.00"),
        "obligated_funding": 0,
        "planned_funding": 0,
        "total_funding": Decimal("1140000.00"),
    }


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_get_can_funding_summary_with_fiscal_year(loaded_db: SQLAlchemy) -> None:
    can = loaded_db.session.get(CAN, 1)
    result = get_can_funding_summary(can, 2023)

    # Remove these because they are set according to when the test was run
    del result["can"]["created_on"]
    del result["can"]["updated_on"]

    assert result == {
        "available_funding": "-860000.00",
        "can": {
            "appropriation_date": None,
            "appropriation_term": 1,
            "arrangement_type": "OPRE_APPROPRIATION",
            "authorizer_id": 26,
            "created_by": None,
            "description": "Healthy Marriages Responsible Fatherhood - OPRE",
            "expiration_date": "01/09/2023",
            "id": 1,
            "managing_portfolio_id": 6,
            "managing_research_project_id": None,
            "nickname": "HMRF-OPRE",
            "number": "G99HRF2",
            "purpose": "",
        },
        "carry_forward_funding": 0,
        "carry_forward_label": "Carry-Forward",
        "received_funding": Decimal("880000.00"),
        "expected_funding": Decimal("260000.00"),
        "expiration_date": "09/01/2023",
        "in_execution_funding": Decimal("2000000.00"),
        "obligated_funding": 0,
        "planned_funding": 0,
        "total_funding": Decimal("1140000.00"),
    }


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_can_get_can_funding_summary(
    client: FlaskClient,  # type: ignore [type-arg]
) -> None:
    response = client.get("/api/v1/can-funding-summary/1")
    assert response.status_code == 200
    assert response.json["can"]["id"] == 1
