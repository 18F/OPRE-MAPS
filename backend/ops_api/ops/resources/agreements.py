from dataclasses import dataclass
from typing import Optional

import desert
from flask import Response, current_app, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request
from marshmallow import fields
from models import ContractType, OpsEventType, User
from models.base import BaseModel
from models.cans import Agreement, AgreementReason, AgreementType, ContractAgreement, GrantAgreement, ProductServiceCode
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI, OPSMethodView
from ops_api.ops.utils.events import OpsEventHandler
from ops_api.ops.utils.query_helpers import QueryHelper
from ops_api.ops.utils.response import make_response_with_headers
from ops_api.ops.utils.user import get_user_from_token
from sqlalchemy.exc import PendingRollbackError, SQLAlchemyError
from sqlalchemy.future import select
from typing_extensions import Any, override

ENDPOINT_STRING = "/agreements"


@dataclass
class TeamMembers:
    id: int
    full_name: Optional[str] = None
    email: Optional[str] = None


@dataclass
class ContractAgreementRequestBody:
    name: str
    number: str
    contract_number: Optional[str] = None
    agreement_type: AgreementType = fields.Enum(AgreementType)
    description: Optional[str] = None
    product_service_code_id: Optional[int] = None
    agreement_reason: Optional[AgreementReason] = None
    incumbent: Optional[str] = None
    project_officer: Optional[int] = None
    team_members: Optional[list[TeamMembers]] = fields.List(
        fields.Nested(TeamMembers),
        default=[],
    )
    research_project_id: Optional[int] = None
    procurement_shop_id: Optional[int] = None
    vendor: Optional[str] = None
    delivered_status: Optional[bool] = fields.Boolean(default=False)
    contract_type: Optional[ContractType] = fields.Enum(ContractType)
    support_contacts: Optional[list[TeamMembers]] = (
        fields.List(
            fields.Nested(TeamMembers),
            default=[],
        ),
    )
    notes: Optional[str] = None


@dataclass(kw_only=True)
class ContractAgreementPatchBody(ContractAgreementRequestBody):
    name: Optional[str] = None
    number: Optional[str] = None


@dataclass
class GrantAgreementRequestBody:
    name: str
    number: str
    agreement_type: AgreementType = fields.Enum(AgreementType)
    description: Optional[str] = None
    product_service_code_id: Optional[int] = None
    agreement_reason: Optional[AgreementReason] = None
    incumbent: Optional[str] = None
    team_members: Optional[list[TeamMembers]] = fields.List(
        fields.Nested(TeamMembers),
        default=[],
    )
    research_project_id: Optional[int] = None
    procurement_shop_id: Optional[int] = None
    foa: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class GrantAgreementPatchBody(GrantAgreementRequestBody):
    name: Optional[str] = None
    number: Optional[str] = None


def pick_patch_schema_class(agreement_type: AgreementType):
    if isinstance(agreement_type, str):
        agreement_type = AgreementType[agreement_type]
    if agreement_type == AgreementType.CONTRACT:
        return ContractAgreementPatchBody
    if agreement_type == AgreementType.GRANT:
        return GrantAgreementPatchBody
    raise ValueError("Invalid agreement_type", agreement_type, type(agreement_type))


@dataclass
class AgreementResponse:
    id: int
    type: str
    name: str
    created_by: int
    number: str
    description: str
    product_service_code: Optional[ProductServiceCode]
    incumbent: str
    project_officer: TeamMembers
    research_project: int
    agreement_type: AgreementType = fields.Enum(AgreementType)
    agreement_reason: AgreementReason = fields.Enum(AgreementReason)
    team_members: Optional[list[TeamMembers]] = None
    budget_line_items: Optional[list[int]] = None
    procurement_shop: Optional[int] = None
    notes: Optional[str] = None


@dataclass
class QueryParameters:
    search: Optional[str] = None
    research_project_id: Optional[int] = None


class AgreementItemAPI(BaseItemAPI):
    def __init__(self, model: BaseModel = Agreement):
        super().__init__(model)

    @override
    @jwt_required()
    def get(self, id: int) -> Response:
        identity = get_jwt_identity()
        is_authorized = self.auth_gateway.is_authorized(identity, ["GET_AGREEMENT"])

        if is_authorized:
            response = self._get_item_with_try(id)

        else:
            response = make_response_with_headers({}, 401)

        return response

    @override
    @jwt_required()
    def patch(self, id: int) -> Response:
        message_prefix = f"PATCH to {ENDPOINT_STRING}"

        identity = get_jwt_identity()
        is_authorized = self.auth_gateway.is_authorized(identity, ["PATCH_AGREEMENT"])
        if not is_authorized:
            return make_response_with_headers({}, 401)

        try:
            with OpsEventHandler(OpsEventType.UPDATE_AGREEMENT) as meta:
                old_agreement: Agreement = self._get_item(id)
                if not old_agreement:
                    raise RuntimeError("Invalid Agreement id.")
                # reject change of agreement_type
                if "agreement_type" in request.json:
                    req_type = request.json["agreement_type"]
                    if req_type != old_agreement.agreement_type:
                        raise ValueError("Invalid agreement_type, agreement_type must not change")
                agreement_type = (
                    request.json["agreement_type"] if "agreement_type" in request.json else old_agreement.agreement_type
                )
                agreement_cls = pick_patch_schema_class(agreement_type)
                schema = desert.schema(agreement_cls)

                OPSMethodView._validate_request(
                    schema=schema,
                    message=f"{message_prefix}: Params failed validation:",
                )

                data = schema.load(request.json)
                data = data.__dict__
                data = {
                    k: v for (k, v) in data.items() if k in request.json
                }  # only keep the attributes from the request body
                print(f"Agreement Data: {data}")
                print(f"Agreement Id: {id}")
                agreement = update_agreement(data, old_agreement)

                current_app.db_session.add(agreement)
                current_app.db_session.commit()

                agreement_dict = agreement.to_dict()
                meta.metadata.update({"updated_agreement": agreement_dict})
                current_app.logger.info(f"{message_prefix}: Updated Agreement: {agreement_dict}")

                return make_response_with_headers({"message": "Agreement updated", "id": agreement.id}, 200)
        except (KeyError, RuntimeError, PendingRollbackError) as re:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"{message_prefix}: {re}")
            return make_response_with_headers({}, 400)
        except SQLAlchemyError as se:
            current_app.logger.error(f"{message_prefix}: {se}")
            return make_response_with_headers({}, 500)


class AgreementListAPI(BaseListAPI):
    def __init__(self, model: BaseModel = Agreement):
        super().__init__(model)
        self._post_schema_contract = desert.schema(ContractAgreementRequestBody)
        self._post_schema_grant = desert.schema(GrantAgreementRequestBody)
        self._get_schema = desert.schema(QueryParameters)

    @staticmethod
    def _get_query(search=None, research_project_id=None):
        stmt = select(Agreement).order_by(Agreement.id)
        query_helper = QueryHelper(stmt)

        if search is not None and len(search) == 0:
            query_helper.return_none()
        elif search:
            query_helper.add_search(Agreement.name, search)

        if research_project_id:
            query_helper.add_column_equals(Agreement.research_project_id, research_project_id)

        stmt = query_helper.get_stmt()
        current_app.logger.debug(f"SQL: {stmt}")

        return stmt

    @override
    @jwt_required()
    def get(self) -> Response:
        identity = get_jwt_identity()
        is_authorized = self.auth_gateway.is_authorized(identity, ["GET_AGREEMENTS"])

        if is_authorized:
            errors = self._get_schema.validate(request.args)

            if errors:
                current_app.logger.error(f"GET /agreements: Query Params failed validation: {errors}")
                return make_response_with_headers(errors, 400)

            search = request.args.get("search")
            research_project_id = request.args.get("research_project_id")

            stmt = self._get_query(search, research_project_id)

            result = current_app.db_session.execute(stmt).all()

            response = make_response_with_headers([i.to_dict() for item in result for i in item])
        else:
            response = make_response_with_headers({}, 401)

        return response

    @override
    @jwt_required()
    def post(self) -> Response:
        message_prefix = f"POST to {ENDPOINT_STRING}"
        try:
            with OpsEventHandler(OpsEventType.CREATE_NEW_AGREEMENT) as meta:
                if "agreement_type" not in request.json:
                    raise RuntimeError(f"{message_prefix}: Params failed validation")

                agreement_type = request.json["agreement_type"]
                match agreement_type:
                    case "CONTRACT":
                        print("contract")
                        errors = self._post_schema_contract.validate(request.json)
                        self.check_errors(errors)

                        data = self._post_schema_contract.load(request.json)
                        new_agreement = self._create_agreement(data, ContractAgreement)

                    case "GRANT":
                        print("grant")
                        errors = self._post_schema_grant.validate(request.json)
                        self.check_errors(errors)

                        data = self._post_schema_grant.load(request.json)
                        new_agreement = self._create_agreement(data, GrantAgreement)

                    case _:
                        raise ValueError("Invalid agreement_type")

                token = verify_jwt_in_request()
                user = get_user_from_token(token[1])
                new_agreement.created_by = user.id

                current_app.db_session.add(new_agreement)
                current_app.db_session.commit()

                new_agreement_dict = new_agreement.to_dict()
                meta.metadata.update({"New Agreement": new_agreement_dict})
                current_app.logger.info(f"POST to {ENDPOINT_STRING}: New Agreement created: {new_agreement_dict}")

                return make_response_with_headers({"message": "Agreement created", "id": new_agreement.id}, 201)
        except RuntimeError as re:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: {re}")
            return make_response_with_headers({}, 400)
        except PendingRollbackError as pr:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: {pr}")
            return make_response_with_headers({}, 400)
        except SQLAlchemyError as se:
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: {se}")
            return make_response_with_headers({}, 500)

    def _create_agreement(self, data, agreement_cls):
        tmp_team_members = data.team_members if data.team_members else []
        data.team_members = []

        if agreement_cls == ContractAgreement:
            tmp_support_contacts = data.support_contacts if data.support_contacts else []
            data.support_contacts = []

        new_agreement = agreement_cls(**data.__dict__)

        new_agreement.team_members.extend([current_app.db_session.get(User, tm_id.id) for tm_id in tmp_team_members])

        if agreement_cls == ContractAgreement:
            new_agreement.support_contacts.extend(
                [current_app.db_session.get(User, tm_id.id) for tm_id in tmp_support_contacts]
            )

        return new_agreement

    def check_errors(self, errors):
        if errors:
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: Params failed validation: {errors}")
            raise RuntimeError(f"POST to {ENDPOINT_STRING}: Params failed validation: {errors}")


class AgreementReasonListAPI(MethodView):
    def get(self) -> Response:
        reasons = [item.name for item in AgreementReason]
        return jsonify(reasons)


class AgreementTypeListAPI(MethodView):
    def get(self) -> Response:
        return jsonify([e.name for e in AgreementType])


def update_data(agreement: Agreement, data: dict[str, Any]) -> None:
    for item in data:
        print(f"update_data: {item=}, {data[item]}")

        if item == "team_members":
            tmp_team_members = data[item]
            agreement.team_members = [current_app.db_session.get(User, tm_id.id) for tm_id in tmp_team_members]
        elif item == "support_contacts":
            tmp_support_contacts = data[item]
            agreement.support_contacts = [current_app.db_session.get(User, tm_id.id) for tm_id in tmp_support_contacts]
        else:
            setattr(agreement, item, data[item])


def update_agreement(data: dict[str, Any], agreement: Agreement):
    update_data(agreement, data)
    current_app.db_session.add(agreement)
    current_app.db_session.commit()
    return agreement
