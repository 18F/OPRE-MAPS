import copy
from datetime import datetime

from flask import Response, current_app, request
from flask_jwt_extended import current_user
from sqlalchemy import or_, select
from sqlalchemy.dialects import postgresql

from models import BudgetLineItem, BudgetLineItemChangeRequest, ChangeRequest, ChangeRequestStatus, Division
from ops_api.ops.auth.auth_types import Permission, PermissionType
from ops_api.ops.auth.decorators import is_authorized
from ops_api.ops.base_views import BaseListAPI
from ops_api.ops.resources import budget_line_items
from ops_api.ops.resources.budget_line_items import validate_and_prepare_change_data
from ops_api.ops.schemas.budget_line_items import PATCHRequestBodySchema
from ops_api.ops.utils.response import make_response_with_headers


def review_change_request(
    change_request_id: int, status_after_review: ChangeRequestStatus, reviewed_by_user_id: int
) -> ChangeRequest:
    session = current_app.db_session
    change_request = session.get(ChangeRequest, change_request_id)
    change_request.reviewed_by_id = reviewed_by_user_id
    change_request.reviewed_on = datetime.now()
    change_request.status = status_after_review

    # If approved, then apply the changes
    if status_after_review == ChangeRequestStatus.APPROVED:
        if isinstance(change_request, BudgetLineItemChangeRequest):
            budget_line_item = session.get(BudgetLineItem, change_request.budget_line_item_id)
            # need to copy to avoid changing the original data in the ChangeRequest and triggering an update
            data = copy.deepcopy(change_request.requested_change_data)
            schema = PATCHRequestBodySchema()
            schema.context["id"] = change_request.budget_line_item_id
            schema.context["method"] = "PATCH"

            change_data, changing_from_data = validate_and_prepare_change_data(
                data,
                budget_line_item,
                schema,
                # ["id", "status", "agreement_id"],
                ["id", "agreement_id"],
                partial=False,
            )

            budget_line_items.update_data(budget_line_item, change_data)
            session.add(budget_line_item)

    session.add(change_request)
    session.commit()
    return change_request


def find_change_requests(limit: int = 10, offset: int = 0):

    current_user_id = getattr(current_user, "id", None)

    stmt = (
        select(ChangeRequest)
        .join(Division, ChangeRequest.managing_division_id == Division.id)
        .where(ChangeRequest.status == ChangeRequestStatus.IN_REVIEW)
        .where(
            or_(
                Division.division_director_id == current_user_id,
                Division.deputy_division_director_id == current_user_id,
            )
        )
    )
    stmt = stmt.limit(limit)
    if offset:
        stmt = stmt.offset(int(offset))
    print(
        f"~~~find_change_requests>>>\n{str(stmt.compile(dialect=postgresql.dialect(), compile_kwargs={'literal_binds': True}))}"
    )
    results = current_app.db_session.execute(stmt).all()
    return results


# TODO: Implement the queries needed for the For Approvals page, for now it's just a placeholder
class ChangeRequestListAPI(BaseListAPI):
    def __init__(self, model: ChangeRequest = ChangeRequest):
        super().__init__(model)

    @is_authorized(PermissionType.GET, Permission.CHANGE_REQUEST)
    def get(self) -> Response:
        limit = request.args.get("limit", 10, type=int)
        offset = request.args.get("offset", 0, type=int)
        results = find_change_requests(limit=limit, offset=offset)
        change_requests = [row[0] for row in results] if results else None
        if change_requests:
            response = make_response_with_headers([change_request.to_dict() for change_request in change_requests])
        else:
            response = make_response_with_headers([], 200)
        return response


class ChangeRequestReviewAPI(BaseListAPI):
    def __init__(self, model: ChangeRequest = ChangeRequest):
        super().__init__(model)

    @is_authorized(PermissionType.POST, Permission.CHANGE_REQUEST_REVIEW)
    def post(self) -> Response:
        request_json = request.get_json()
        change_request_id = request_json.get("change_request_id")
        action = request_json.get("action", "").upper()
        if action == "APPROVE":
            status_after_review = ChangeRequestStatus.APPROVED
        elif action == "REJECT":
            status_after_review = ChangeRequestStatus.REJECTED
        else:
            raise ValueError(f"Invalid action: {action}")

        reviewed_by_user_id = current_user.id

        change_request = review_change_request(change_request_id, status_after_review, reviewed_by_user_id)

        return make_response_with_headers(change_request.to_dict(), 200)
