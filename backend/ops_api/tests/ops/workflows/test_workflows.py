import datetime
from decimal import Decimal

import pytest
from flask import url_for

from models import (
    AgreementChangeRequest,
    BudgetLineItem,
    BudgetLineItemChangeRequest,
    BudgetLineItemStatus,
    ChangeRequest,
    WorkflowAction,
    WorkflowInstance,
    WorkflowStepInstance,
    WorkflowStepStatus,
    WorkflowStepTemplate,
    WorkflowStepType,
    WorkflowTemplate,
    WorkflowTriggerType,
)


@pytest.mark.usefixtures("app_ctx")
def test_workflow_instance_retrieve(auth_client, loaded_db):
    workflow_instance = loaded_db.get(WorkflowInstance, 1)

    assert workflow_instance is not None
    assert workflow_instance.associated_type == WorkflowTriggerType.CAN
    assert workflow_instance.associated_id == 1
    assert workflow_instance.workflow_template_id == 1
    assert workflow_instance.workflow_action == WorkflowAction.DRAFT_TO_PLANNED
    assert workflow_instance.workflow_status == WorkflowStepStatus.APPROVED


@pytest.mark.usefixtures("app_ctx")
def test_workflow_step_instance_retrieve(auth_client, loaded_db):
    workflow_step_instance = loaded_db.get(WorkflowStepInstance, 1)

    assert workflow_step_instance is not None
    assert workflow_step_instance.workflow_instance_id == 1
    assert workflow_step_instance.workflow_step_template_id == 1
    assert workflow_step_instance.status == WorkflowStepStatus.APPROVED
    assert workflow_step_instance.notes == "Need approved ASAP!"
    assert workflow_step_instance.time_started is not None
    assert workflow_step_instance.time_completed is not None


@pytest.mark.usefixtures("app_ctx")
def test_workflow_template_retrieve(auth_client, loaded_db):
    workflow_template = loaded_db.get(WorkflowTemplate, 1)

    assert workflow_template is not None
    assert workflow_template.name == "Basic Approval"
    assert workflow_template.steps is not None


@pytest.mark.usefixtures("app_ctx")
def test_workflow_step_template_retrieve(auth_client, loaded_db):
    workflow_step_template = loaded_db.get(WorkflowStepTemplate, 1)

    assert workflow_step_template is not None
    assert workflow_step_template.name == "Initial Review"
    assert workflow_step_template.workflow_type == WorkflowStepType.APPROVAL
    assert workflow_step_template.index == 0
    assert workflow_step_template.step_approvers is not None


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_get_workflow_instance_by_id(auth_client):
    response = auth_client.get("/api/v1/workflow-instance/1")
    assert response.status_code == 200
    assert response.json["id"] == 1


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_get_workflow_step_instance_by_id(auth_client):
    response = auth_client.get("/api/v1/workflow-step-instance/1")
    assert response.status_code == 200
    assert response.json["id"] == 1


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_get_workflow_template_by_id(auth_client):
    response = auth_client.get("/api/v1/workflow-template/1")
    assert response.status_code == 200
    assert response.json["id"] == 1


@pytest.mark.usefixtures("app_ctx")
@pytest.mark.usefixtures("loaded_db")
def test_get_workflow_step_template_by_id(auth_client):
    response = auth_client.get("/api/v1/workflow-step-template/1")
    assert response.status_code == 200
    assert response.json["id"] == 1


# ---=== CHANGE REQUESTS ===---


@pytest.mark.usefixtures("app_ctx")
def test_change_request(auth_client, app):
    session = app.db_session
    change_request = ChangeRequest()
    change_request.created_by = 1
    change_request.requested_change_data = {"foo": "bar"}
    session.add(change_request)
    session.commit()

    assert change_request.id is not None
    new_change_request_id = change_request.id
    change_request = session.get(ChangeRequest, new_change_request_id)
    assert change_request.type == "change_request"

    session.delete(change_request)
    session.commit()


@pytest.mark.usefixtures("app_ctx")
def test_agreement_change_request(auth_client, app):
    session = app.db_session
    change_request = AgreementChangeRequest()
    change_request.agreement_id = 1
    change_request.created_by = 1
    change_request.requested_change_data = {"foo": "bar"}
    session.add(change_request)
    session.commit()

    assert change_request.id is not None
    new_change_request_id = change_request.id
    change_request = session.get(ChangeRequest, new_change_request_id)
    assert change_request.type == "agreement_change_request"

    session.delete(change_request)
    session.commit()


@pytest.mark.usefixtures("app_ctx")
def test_budget_line_item_change_request(auth_client, app):
    session = app.db_session
    change_request = BudgetLineItemChangeRequest()
    change_request.budget_line_item_id = 1
    change_request.agreement_id = 1
    change_request.created_by = 1
    change_request.requested_change_data = {"foo": "bar"}
    session.add(change_request)
    session.commit()

    assert change_request.id is not None
    new_change_request_id = change_request.id
    change_request = session.get(ChangeRequest, new_change_request_id)
    assert change_request.type == "budget_line_item_change_request"

    session.delete(change_request)
    session.commit()


@pytest.mark.usefixtures("app_ctx")
def test_budget_line_item_patch_with_budgets_change_requests(auth_client, app):
    session = app.db_session
    #  create PLANNED BLI
    bli = BudgetLineItem(
        line_description="Grant Expenditure GA999",
        agreement_id=1,
        can_id=1,
        amount=111.11,
        status=BudgetLineItemStatus.PLANNED,
    )
    session.add(bli)
    session.commit()
    assert bli.id is not None
    bli_id = bli.id

    #  submit PATCH BLI which triggers a budget change requests
    data = {"amount": 222.22, "can_id": 2, "date_needed": "2032-02-02"}
    response = auth_client.patch(url_for("api.budget-line-items-item", id=bli_id), json=data)
    assert response.status_code == 202
    resp_json = response.json
    assert "change_requests_in_review" in resp_json
    change_requests_in_review = resp_json["change_requests_in_review"]
    assert len(change_requests_in_review) == 3

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
        assert "requested_change_data" in change_request
        requested_change_data = change_request["requested_change_data"]
        assert "requested_change_diff" in change_request
        requested_change_diff = change_request["requested_change_diff"]
        assert requested_change_diff.keys() == requested_change_data.keys()
        if "amount" in requested_change_data:
            assert requested_change_data["amount"] == 222.22
            assert requested_change_diff["amount"]["old"] == 111.11
            assert requested_change_diff["amount"]["new"] == 222.22
        if "date_needed" in requested_change_data:
            assert requested_change_data["date_needed"] == "2032-02-02"
            assert requested_change_diff["date_needed"]["old"] is None
            assert requested_change_diff["date_needed"]["new"] == "2032-02-02"
        if "can_id" in requested_change_data:
            assert can_id_change_request_id is None
            can_id_change_request_id = change_request_id
            assert requested_change_data["can_id"] == 2
            assert requested_change_diff["can_id"]["old"] == 1
            assert requested_change_diff["can_id"]["new"] == 2
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

    # verify the BLI was updated
    bli = session.get(BudgetLineItem, bli_id)
    assert bli.amount == Decimal("222.22")
    assert bli.can_id == 1  # can_id change request was rejected
    assert bli.date_needed == datetime.date(2032, 2, 2)
    assert bli.change_requests_in_review is None
    assert bli.in_review is False

    # verify delete cascade
    session.delete(bli)
    session.commit()
    for change_request_id in change_request_ids:
        change_request = session.get(BudgetLineItemChangeRequest, change_request_id)
        assert change_request is None
    bli = session.get(BudgetLineItem, bli_id)
    assert bli is None
