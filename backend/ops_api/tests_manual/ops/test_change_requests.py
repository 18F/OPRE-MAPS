import datetime
import json
import sys
from decimal import Decimal

import pytest
from flask import url_for

from ops_api.ops.resources.agreement_history import build_agreement_history_dict, find_agreement_histories

test_user_id = 4
test_user_name = "Amelia Popham"
today = datetime.datetime.today().strftime("%Y-%m-%d")

from models import Agreement, BudgetLineItem, BudgetLineItemStatus
from models.workflows import (
    BudgetLineItemChangeRequest,
    Package,
    PackageSnapshot,
    WorkflowAction,
    WorkflowInstance,
    WorkflowStepInstance,
    WorkflowStepStatus,
    WorkflowTriggerType,
)


@pytest.mark.skipif(
    "test_change_requests.py::test_budget_line_item_patch_with_budgets_change_requests" not in sys.argv,
    reason="Skip unless run manually by itself",
)
@pytest.mark.usefixtures("app_ctx")
def test_budget_line_item_patch_with_budgets_change_requests(auth_client, app):
    session = app.db_session
    agreement_id = 1
    hists = find_agreement_histories(agreement_id, limit=100)
    prev_hist_count = len(hists)

    #  create PLANNED BLI
    bli = BudgetLineItem(
        line_description="Test Experiments Workflows BLI",
        agreement_id=agreement_id,
        can_id=1,
        amount=111.11,
        status=BudgetLineItemStatus.PLANNED,
        created_by=test_user_id,
    )
    session.add(bli)
    session.commit()
    assert bli.id is not None
    bli_id = bli.id

    # verify agreement history added
    hists = find_agreement_histories(agreement_id, limit=100)
    hist_count = len(hists)
    assert hist_count == prev_hist_count + 1
    prev_hist_count = hist_count

    #  submit PATCH BLI which triggers a budget change requests
    data = {"amount": 222.22, "can_id": 2, "date_needed": "2032-02-02"}
    response = auth_client.patch(url_for("api.budget-line-items-item", id=bli_id), json=data)
    assert response.status_code == 202
    resp_json = response.json
    assert "change_requests_in_review" in resp_json
    change_requests_in_review = resp_json["change_requests_in_review"]
    assert len(change_requests_in_review) == 3

    # verify agreement history added for 3 change requests
    hists = find_agreement_histories(agreement_id, limit=100)
    hist_count = len(hists)
    assert hist_count == prev_hist_count + 3
    prev_hist_count = hist_count

    can_id_change_request_id = None
    change_request_ids = []
    for change_request in change_requests_in_review:
        assert "id" in change_request
        change_request_id = change_request["id"]
        change_request_ids.append(change_request_id)
        assert change_request["type"] == "budget_line_item_change_request"
        assert change_request["budget_line_item_id"] == bli_id
        assert change_request["has_budget_change"] is True
        assert change_request["has_status_change"] is False
        if "can_id" in change_request["requested_change_data"]:
            assert can_id_change_request_id is None
            can_id_change_request_id = change_request_id
    assert can_id_change_request_id is not None

    # verify the BLI was not updated yet
    bli = session.get(BudgetLineItem, bli_id)
    assert str(bli.amount) == "111.11"
    assert bli.amount == Decimal("111.11")
    assert bli.can_id == 1
    assert bli.date_needed is None
    assert len(bli.change_requests_in_review) == len(change_request_ids)
    assert bli.in_review is True

    # verify the change requests and in_review are in the BLI
    response = auth_client.get(url_for("api.budget-line-items-item", id=bli_id))
    assert response.status_code == 200
    resp_json = response.json
    assert "change_requests_in_review" in resp_json
    assert len(resp_json["change_requests_in_review"]) == 3
    assert "in_review" in resp_json
    assert resp_json["in_review"] is True

    # verify the change requests and in_review are in the agreement's BLIs
    response = auth_client.get(url_for("api.agreements-item", id=bli.agreement_id))
    assert response.status_code == 200
    resp_json = response.json
    assert "budget_line_items" in resp_json
    ag_blis = resp_json["budget_line_items"]
    ag_bli = next((bli for bli in ag_blis if bli["id"] == bli_id), None)
    assert ag_bli is not None
    assert "in_review" in ag_bli
    assert ag_bli["in_review"] is True
    assert "change_requests_in_review" in ag_bli
    assert len(ag_bli["change_requests_in_review"]) == 3
    ag_bli_other = next((bli for bli in ag_blis if bli["id"] != bli_id), None)
    assert "in_review" in ag_bli_other
    assert ag_bli_other["in_review"] is False
    assert "change_requests_in_review" in ag_bli
    assert ag_bli_other["change_requests_in_review"] is None

    # review the change requests, reject the can_id change request and approve the others
    for change_request_id in change_request_ids:
        action = "REJECT" if change_request_id == can_id_change_request_id else "APPROVE"
        data = {"change_request_id": change_request_id, "action": action}
        response = auth_client.post(url_for("api.change-request-review-list"), json=data)
        assert response.status_code == 200

    # verify agreement history added for 3 reviews and 2 approved updates
    hists = find_agreement_histories(agreement_id, limit=100)
    hist_count = len(hists)
    assert hist_count == prev_hist_count + 5
    prev_hist_count = hist_count

    # verify the BLI was updated
    bli = session.get(BudgetLineItem, bli_id)
    assert bli.amount == Decimal("222.22")
    assert bli.can_id == 1  # can_id change request was rejected
    assert bli.date_needed == datetime.date(2032, 2, 2)
    assert bli.change_requests_in_review is None
    assert bli.in_review is False

    # verify delete cascade
    # session.delete(bli)
    # session.commit()
    # for change_request_id in change_request_ids:
    #     change_request = session.get(BudgetLineItemChangeRequest, change_request_id)
    #     assert change_request is None
    # bli = session.get(BudgetLineItem, bli_id)
    # assert bli is None
    #
    # # verify agreement history added for 1 BLI delete (cascading CR deletes are not tracked)
    # hists = find_agreement_histories(agreement_id, limit=100)
    # hist_count = len(hists)
    # assert hist_count == prev_hist_count + 1


@pytest.mark.skipif(
    "test_change_requests.py::test_budget_line_item_change_request_history" not in sys.argv,
    reason="Skip unless run manually by itself",
)
@pytest.mark.usefixtures("app_ctx")
def test_budget_line_item_change_request_history(auth_client, app):
    data = {
        "agreement_type": "CONTRACT",
        "agreement_reason": "NEW_REQ",
        "name": "Agreement test budget line item change request history",
        "description": "Description",
        "product_service_code_id": 1,
        "incumbent": "Vendor A",
        "project_officer_id": 21,
        "team_members": [
            {
                "id": 4,
            },
            {
                "id": 23,
            },
        ],
        "notes": "New Agreement for purpose X",
    }
    resp = auth_client.post("/api/v1/agreements/", json=data)
    assert resp.status_code == 201
    assert "id" in resp.json
    agreement_id = resp.json["id"]

    session = app.db_session
    hists = find_agreement_histories(agreement_id, limit=100)
    prev_hist_count = len(hists)

    #  create BLI
    bli = BudgetLineItem(
        line_description="Test Experiments Workflows BLI",
        agreement_id=agreement_id,
        can_id=1,
        amount=111.11,
        status=BudgetLineItemStatus.DRAFT,
        created_by=test_user_id,
    )
    #  update to PLANNED
    bli.status = BudgetLineItemStatus.PLANNED
    session.add(bli)
    session.commit()
    assert bli.id is not None
    bli_id = bli.id

    # verify agreement history added
    hists = find_agreement_histories(agreement_id, limit=100)
    hist_count = len(hists)
    assert hist_count == prev_hist_count + 1
    prev_hist_count = hist_count
    print(f"\n~~~ HIST1 {len(hists)=} ~~~\n")

    # hist_dicts = [build_agreement_history_dict(row[0], None) for row in hists]
    # for hist_dict in hist_dicts:
    #     print(f"\n\n~~~{hist_dict['class_name']} {hist_dict['row_key']} {hist_dict['event_type']} ~~~")
    #     print(json.dumps(hist_dict, indent=2))

    #  submit PATCH BLI which triggers a budget change requests
    data = {"amount": 222.22, "can_id": 2, "date_needed": "2032-02-02"}
    response = auth_client.patch(url_for("api.budget-line-items-item", id=bli_id), json=data)
    assert response.status_code == 202
    resp_json = response.json
    assert "change_requests_in_review" in resp_json
    change_requests_in_review = resp_json["change_requests_in_review"]
    assert len(change_requests_in_review) == 3

    # verify agreement history added for 3 change requests
    hists = find_agreement_histories(agreement_id, limit=100)
    hist_count = len(hists)
    assert hist_count == prev_hist_count + 3
    prev_hist_count = hist_count

    print(f"\n~~~ HIST2 {len(hists)=} ~~~\n")
    hist_dicts = [build_agreement_history_dict(row[0]) for row in hists]
    for hist_dict in hist_dicts:
        print(f"\n\n~~~{hist_dict['class_name']} {hist_dict['row_key']} {hist_dict['event_type']} ~~~")
        # print(json.dumps(hist_dict, indent=2))

    #
    # can_id_change_request_id = None
    # change_request_ids = []
    # for change_request in change_requests_in_review:
    #     assert "id" in change_request
    #     change_request_id = change_request["id"]
    #     change_request_ids.append(change_request_id)
    #     assert change_request["type"] == "budget_line_item_change_request"
    #     assert change_request["budget_line_item_id"] == bli_id
    #     assert change_request["has_budget_change"] is True
    #     assert change_request["has_status_change"] is False
    #     if "can_id" in change_request["requested_change_data"]:
    #         assert can_id_change_request_id is None
    #         can_id_change_request_id = change_request_id
    # assert can_id_change_request_id is not None
    #
    # # verify the BLI was not updated yet
    # bli = session.get(BudgetLineItem, bli_id)
    # assert str(bli.amount) == "111.11"
    # assert bli.amount == Decimal("111.11")
    # assert bli.can_id == 1
    # assert bli.date_needed is None
    # assert len(bli.change_requests_in_review) == len(change_request_ids)
    # assert bli.in_review is True
    #
    # # verify the change requests and in_review are in the BLI
    # response = auth_client.get(url_for("api.budget-line-items-item", id=bli_id))
    # assert response.status_code == 200
    # resp_json = response.json
    # assert "change_requests_in_review" in resp_json
    # assert len(resp_json["change_requests_in_review"]) == 3
    # assert "in_review" in resp_json
    # assert resp_json["in_review"] is True
    #
    # # verify the change requests and in_review are in the agreement's BLIs
    # response = auth_client.get(url_for("api.agreements-item", id=bli.agreement_id))
    # assert response.status_code == 200
    # resp_json = response.json
    # assert "budget_line_items" in resp_json
    # ag_blis = resp_json["budget_line_items"]
    # ag_bli = next((bli for bli in ag_blis if bli["id"] == bli_id), None)
    # assert ag_bli is not None
    # assert "in_review" in ag_bli
    # assert ag_bli["in_review"] is True
    # assert "change_requests_in_review" in ag_bli
    # assert len(ag_bli["change_requests_in_review"]) == 3
    # ag_bli_other = next((bli for bli in ag_blis if bli["id"] != bli_id), None)
    # assert "in_review" in ag_bli_other
    # assert ag_bli_other["in_review"] is False
    # assert "change_requests_in_review" in ag_bli
    # assert ag_bli_other["change_requests_in_review"] is None
    #
    # # review the change requests, reject the can_id change request and approve the others
    # for change_request_id in change_request_ids:
    #     action = "REJECT" if change_request_id == can_id_change_request_id else "APPROVE"
    #     data = {"change_request_id": change_request_id, "action": action}
    #     response = auth_client.post(url_for("api.change-request-review-list"), json=data)
    #     assert response.status_code == 200
    #
    # # verify agreement history added for 3 reviews and 2 approved updates
    # hists = find_agreement_histories(agreement_id, limit=100)
    # hist_count = len(hists)
    # assert hist_count == prev_hist_count + 5
    # prev_hist_count = hist_count
    #
    # # verify the BLI was updated
    # bli = session.get(BudgetLineItem, bli_id)
    # assert bli.amount == Decimal("222.22")
    # assert bli.can_id == 1  # can_id change request was rejected
    # assert bli.date_needed == datetime.date(2032, 2, 2)
    # assert bli.change_requests_in_review is None
    # assert bli.in_review is False
    #
    # # verify delete cascade
    # session.delete(bli)
    # session.commit()
    # for change_request_id in change_request_ids:
    #     change_request = session.get(BudgetLineItemChangeRequest, change_request_id)
    #     assert change_request is None
    # bli = session.get(BudgetLineItem, bli_id)
    # assert bli is None
    #
    # # verify agreement history added for 1 BLI delete (cascading CR deletes are not tracked)
    # hists = find_agreement_histories(agreement_id, limit=100)
    # hist_count = len(hists)
    # assert hist_count == prev_hist_count + 1


@pytest.mark.skipif(
    "test_change_requests.py::test_agreement_history_with_change_requests" not in sys.argv,
    reason="Skip unless run manually by itself",
)
@pytest.mark.usefixtures("app_ctx")
def test_agreement_history_with_change_requests(auth_client, app):
    session = app.db_session
    agreement_id = None
    bli = None

    try:

        # create agreement (using API)
        data = {
            "agreement_type": "CONTRACT",
            "agreement_reason": "NEW_REQ",
            "name": "TEST: Agreement history with change requests",
            "description": "Description",
            "product_service_code_id": 1,
            "incumbent": "Vendor A",
            "project_officer_id": 21,
            "team_members": [
                {
                    "id": 4,
                },
                {
                    "id": 23,
                },
            ],
            "notes": "New Agreement for purpose X",
        }
        resp = auth_client.post("/api/v1/agreements/", json=data)
        assert resp.status_code == 201
        assert "id" in resp.json
        agreement_id = resp.json["id"]

        # verify agreement history (+1 agreement created)
        prev_hist_count = 0
        resp = auth_client.get(f"/api/v1/agreements/{agreement_id}/history/?limit=100")
        assert resp.status_code == 200
        resp_json = resp.json
        # print("~~~~history~~~~", json.dumps(resp_json, indent=2))
        hist_count = len(resp_json)
        assert hist_count == prev_hist_count + 1
        prev_hist_count = hist_count
        log_items = resp_json[0]["log_items"]
        assert len(log_items) == 1
        log_item = log_items[0]
        assert log_item["event_class_name"] == "ContractAgreement"
        assert log_item["target_class_name"] == "ContractAgreement"
        assert log_item["created_by_user_full_name"] == "Amelia Popham"
        assert log_item["event_type"] == "NEW"
        assert log_item["scope"] == "object"
        assert log_item["created_on"] is not None
        assert log_item["created_on"].startswith(datetime.datetime.today().strftime("%Y-%m-%dT"))

        # update Agreement
        data = {
            "name": "TEST: Agreement history with change requests EDITED",
            "description": "Description EDITED",
            # "incumbent": "Vendor B",
            # "project_officer_id": 22,
            # "team_members": [
            #     {
            #         "id": 4,
            #     },
            #     {
            #         "id": 23,
            #     },
            #     {
            #         "id": 24,
            #     },
            # ],
            # "notes": "Updated Agreement for purpose X",
        }
        resp = auth_client.patch(f"/api/v1/agreements/{agreement_id}", json=data)
        assert resp.status_code == 200

        # verify agreement history (+1 agreement updated)
        resp = auth_client.get(f"/api/v1/agreements/{agreement_id}/history/?limit=100")
        assert resp.status_code == 200
        resp_json = resp.json
        # print("~~~~history~~~~", json.dumps(resp_json, indent=2))
        hist_count = len(resp_json)
        assert hist_count == prev_hist_count + 1
        prev_hist_count = hist_count
        log_items = resp_json[0]["log_items"]
        assert len(log_items) == 2
        log_item = log_items[0]
        assert log_item["event_class_name"] == "ContractAgreement"
        assert log_item["target_class_name"] == "ContractAgreement"
        assert log_item["created_by_user_full_name"] == "Amelia Popham"
        assert log_item["event_type"] == "UPDATED"
        assert log_item["scope"] == "property"
        assert log_item["property_key"] == "name"
        assert log_item["change"] == {
            "new": "TEST: Agreement history with change requests EDITED",
            "old": "TEST: Agreement history with change requests",
        }
        assert log_item["created_on"] is not None
        assert log_item["created_on"].startswith(datetime.datetime.today().strftime("%Y-%m-%dT"))

        #  create BLI
        bli = BudgetLineItem(
            line_description="Test Experiments Workflows BLI",
            agreement_id=agreement_id,
            can_id=1,
            amount=111.11,
            status=BudgetLineItemStatus.DRAFT,
            created_by=test_user_id,
            date_needed=datetime.date(2025, 1, 1),
        )
        session.add(bli)
        session.commit()
        assert bli.id is not None
        bli_id = bli.id

        # verify agreement history added (+1 BLI created)
        resp = auth_client.get(f"/api/v1/agreements/{agreement_id}/history/?limit=100")
        assert resp.status_code == 200
        resp_json = resp.json
        print("~~~~history (after BLI create) ~~~~", json.dumps(resp_json, indent=2))
        hist_count = len(resp_json)
        assert hist_count == prev_hist_count + 1
        prev_hist_count = hist_count
        log_items = resp_json[0]["log_items"]
        assert len(log_items) == 1
        log_item = log_items[0]
        assert log_item["event_class_name"] == "BudgetLineItem"
        assert log_item["created_by_user_full_name"] == "Amelia Popham"
        assert log_item["event_type"] == "NEW"
        assert log_item["scope"] == "object"
        assert log_item["created_on"] is not None
        assert log_item["created_on"].startswith(datetime.datetime.today().strftime("%Y-%m-%dT"))

        # update BLI
        bli.can_id = 2
        bli.amount = 222.22
        bli.date_needed = datetime.date(2025, 2, 2)
        session.add(bli)
        session.commit()

        # verify agreement history added (+1 BLI update with 3 log_item)
        resp = auth_client.get(f"/api/v1/agreements/{agreement_id}/history/?limit=100")
        assert resp.status_code == 200
        resp_json = resp.json
        print("~~~~history (after BLI update) ~~~~", json.dumps(resp_json, indent=2))
        hist_count = len(resp_json)
        assert hist_count == prev_hist_count + 1
        prev_hist_count = hist_count
        log_items = resp_json[0]["log_items"]
        assert len(log_items) == 3
        log_item = log_items[0]
        assert log_item["event_class_name"] == "BudgetLineItem"
        assert log_item["created_by_user_full_name"] == "Amelia Popham"
        assert log_item["event_type"] == "UPDATED"
        assert log_item["scope"] == "property"
        assert log_item["created_on"] is not None
        assert log_item["created_on"].startswith(datetime.datetime.today().strftime("%Y-%m-%dT"))

        #  update BLI to PLANNED
        bli.status = BudgetLineItemStatus.PLANNED
        session.add(bli)
        session.commit()

        # verify agreement history added (+1 BLI created)
        resp = auth_client.get(f"/api/v1/agreements/{agreement_id}/history/?limit=100")
        assert resp.status_code == 200
        resp_json = resp.json
        # print("~~~~history~~~~", json.dumps(resp_json, indent=2))
        hist_count = len(resp_json)
        assert hist_count == prev_hist_count + 1
        prev_hist_count = hist_count
        log_items = resp_json[0]["log_items"]
        assert len(log_items) == 1
        log_item = log_items[0]
        assert log_item["scope"] == "property"
        assert log_item["event_class_name"] == "BudgetLineItem"
        assert log_item["target_class_name"] == "BudgetLineItem"
        assert log_item["property_key"] == "status"
        assert log_item["event_type"] == "UPDATED"
        assert log_item["created_on"] is not None
        assert log_item["created_on"].startswith(datetime.datetime.today().strftime("%Y-%m-%dT"))
        assert log_item["change"] == {"new": "PLANNED", "old": "DRAFT"}

        #  submit PATCH BLI which triggers a budget change requests
        # data = {"amount": 222.22, "can_id": 2, "date_needed": "2032-02-02"}
        # response = auth_client.patch(url_for("api.budget-line-items-item", id=bli_id), json=data)
        # assert response.status_code == 202
        # resp_json = response.json
        # assert "change_requests_in_review" in resp_json
        # change_requests_in_review = resp_json["change_requests_in_review"]
        # assert len(change_requests_in_review) == 3
        #
        # # verify agreement history added for 3 change requests
        # hists = find_agreement_histories(agreement_id, limit=100)
        # hist_count = len(hists)
        # assert hist_count == prev_hist_count + 3
        # prev_hist_count = hist_count

    finally:
        # cleanup
        if bli:
            session.delete(bli)
        if agreement_id:
            agreement = session.get(Agreement, agreement_id)
            session.delete(agreement)
        session.commit()
