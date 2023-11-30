import datetime

import pytest
from models.cans import CAN, CANArrangementType


@pytest.mark.usefixtures("app_ctx")
def test_can_retrieve(loaded_db):
    can = loaded_db.query(CAN).filter(CAN.number == "G99HRF2").one()

    assert can is not None
    assert can.number == "G99HRF2"
    assert can.description == "Healthy Marriages Responsible Fatherhood - OPRE"
    assert can.purpose == ""
    assert can.nickname == "HMRF-OPRE"
    assert can.appropriation_term == 1
    assert can.authorizer_id == 26
    assert can.managing_portfolio_id == 6
    assert can.arrangement_type == CANArrangementType.OPRE_APPROPRIATION
    # assert can.funding_sources == []
    # assert can.shared_portfolios == [2]
    # assert can.budget_line_items == []


def test_can_creation(loaded_db):
    can = CAN(
        number="G990991-X",
        description="Secondary Analyses Data On Child Care & Early Edu",
        purpose="Secondary Analyses of Child Care and Early Education Data (2022)",
        nickname="ABCD",
        arrangement_type=CANArrangementType.COST_SHARE,
        authorizer_id=1,
        managing_portfolio_id=2,
        expiration_date=datetime.datetime(2022, 9, 30, 1, 1, 1),
    )

    serialized = can.to_dict()

    assert can is not None
    assert serialized["number"] == "G990991-X"


@pytest.mark.usefixtures("app_ctx")
def test_can_get_all(auth_client, loaded_db):
    assert loaded_db.query(CAN).count() == 16

    response = auth_client.get("/api/v1/cans/")
    assert response.status_code == 200
    assert len(response.json) == 16


@pytest.mark.usefixtures("app_ctx")
def test_can_get_by_id(auth_client, loaded_db):
    response = auth_client.get("/api/v1/cans/1")
    assert response.status_code == 200
    assert response.json["number"] == "G99HRF2"


@pytest.mark.usefixtures("app_ctx")
def test_can_get_portfolio_cans(auth_client, loaded_db):
    response = auth_client.get("/api/v1/cans/portfolio/1")
    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0]["id"] == 2


@pytest.mark.usefixtures("app_ctx")
def test_get_cans_search_filter(auth_client, loaded_db):
    response = auth_client.get("/api/v1/cans/?search=XXX8")
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["id"] == 13

    response = auth_client.get("/api/v1/cans/?search=G99HRF2")
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["id"] == 1

    response = auth_client.get("/api/v1/cans/?search=")
    assert response.status_code == 200
    assert len(response.json) == 0
