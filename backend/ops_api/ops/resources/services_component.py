from datetime import date
from functools import partial

import marshmallow_dataclass as mmdc
from flask import Response, current_app, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models import ContractAgreement, OpsEventType, ServicesComponent
from models.base import BaseModel
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI, handle_api_error
from ops_api.ops.resources.services_component_schemas import (
    PATCHRequestBody,
    POSTRequestBody,
    QueryParameters,
    ServicesComponentItemResponse,
)
from ops_api.ops.utils.api_helpers import get_change_data, update_and_commit_model_instance
from ops_api.ops.utils.auth import ExtraCheckError, Permission, PermissionType, is_authorized
from ops_api.ops.utils.events import OpsEventHandler
from ops_api.ops.utils.response import make_response_with_headers
from ops_api.ops.utils.user import get_user_from_token
from sqlalchemy import select
from typing_extensions import override

ENDPOINT_STRING = "/services-components"


def sc_associated_with_contract_agreement(self, id: int, permission_type: PermissionType) -> bool:
    jwt_identity = get_jwt_identity()
    try:
        contract_agreement_id = request.json["contract_agreement_id"]
        agreement_stmt = select(ContractAgreement).where(ContractAgreement.id == contract_agreement_id)
        contract_agreement = current_app.db_session.scalar(agreement_stmt)

    except KeyError:
        sc: ServicesComponent = current_app.db_session.get(ServicesComponent, id)
        try:
            contract_agreement = sc.contract_agreement
        except AttributeError as e:
            # No BLI found in the DB. Erroring out.
            raise ExtraCheckError({}) from e

    if contract_agreement is None:
        # We are faking a validation check at this point. We know there is no agreement associated with the SC.
        # This is made to emulate the validation check from a marshmallow schema.
        if permission_type == PermissionType.PUT:
            raise ExtraCheckError(
                {
                    "_schema": ["Services Component must have a Contract Agreement"],
                    "contract_agreement_id": ["Missing data for required field."],
                }
            )
        elif permission_type == PermissionType.PATCH:
            raise ExtraCheckError({"_schema": ["Services Component must have a Contract Agreement"]})
        else:
            raise ExtraCheckError({})

    oidc_ids = set()
    if contract_agreement.created_by_user:
        oidc_ids.add(str(contract_agreement.created_by_user.oidc_id))
    if contract_agreement.project_officer:
        oidc_ids.add(str(contract_agreement.project_officer.oidc_id))
    oidc_ids |= set(str(tm.oidc_id) for tm in contract_agreement.team_members)

    ret = jwt_identity in oidc_ids

    return ret


# TODO: Permissions (stop using BLI perms and events and sort out rules for SCs)
class ServicesComponentItemAPI(BaseItemAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)
        self._response_schema = mmdc.class_schema(ServicesComponentItemResponse)()
        self._put_schema = mmdc.class_schema(POSTRequestBody)()
        self._patch_schema = mmdc.class_schema(PATCHRequestBody)()

    def _update(self, id, method, schema) -> Response:
        message_prefix = f"{method} to {ENDPOINT_STRING}"

        with OpsEventHandler(OpsEventType.UPDATE_SERVICES_COMPONENT) as meta:
            old_services_component: ServicesComponent = self._get_item(id)
            if not old_services_component:
                raise ValueError(f"Invalid ServicesComponent id: {id}.")

            schema.context["id"] = id
            schema.context["method"] = method

            data = get_change_data(request.json, old_services_component, schema)
            data["period_start"] = date.fromisoformat(data["period_start"]) if data.get("period_start") else None
            data["period_end"] = date.fromisoformat(data["period_end"]) if data.get("period_end") else None
            services_component = update_and_commit_model_instance(old_services_component, data)

            sc_dict = self._response_schema.dump(services_component)
            meta.metadata.update({"services_component": sc_dict})
            current_app.logger.info(f"{message_prefix}: Updated ServicesComponent: {sc_dict}")

            return make_response_with_headers(sc_dict, 200)

    @override
    @is_authorized(
        PermissionType.PUT,
        Permission.SERVICES_COMPONENT,
        extra_check=partial(sc_associated_with_contract_agreement, permission_type=PermissionType.PUT),
        groups=["Budget Team", "Admins"],
    )
    @handle_api_error
    def put(self, id: int) -> Response:
        return self._update(id, "PUT", self._put_schema)

    @override
    @is_authorized(
        PermissionType.PATCH,
        Permission.SERVICES_COMPONENT,
        extra_check=partial(sc_associated_with_contract_agreement, permission_type=PermissionType.PATCH),
        groups=["Budget Team", "Admins"],
    )
    @handle_api_error
    def patch(self, id: int) -> Response:
        return self._update(id, "PATCH", self._patch_schema)

    @override
    @is_authorized(
        PermissionType.DELETE,
        Permission.AGREEMENT,
        extra_check=partial(sc_associated_with_contract_agreement, permission_type=PermissionType.PATCH),
        groups=["Budget Team", "Admins"],
    )
    @handle_api_error
    def delete(self, id: int) -> Response:
        with OpsEventHandler(OpsEventType.DELETE_SERVICES_COMPONENT) as meta:
            sc: ServicesComponent = self._get_item(id)

            if not sc:
                raise RuntimeError(f"Invalid ServicesComponent id: {id}.")

            # TODO when can we not delete?

            current_app.db_session.delete(sc)
            current_app.db_session.commit()

            meta.metadata.update({"Deleted ServicesComponent": id})

            return make_response_with_headers({"message": "ServicesComponent deleted", "id": sc.id}, 200)


class ServicesComponentListAPI(BaseListAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)
        self._post_schema = mmdc.class_schema(POSTRequestBody)()
        self._get_schema = mmdc.class_schema(QueryParameters)()
        self._response_schema = mmdc.class_schema(ServicesComponentItemResponse)()
        self._response_schema_collection = mmdc.class_schema(ServicesComponentItemResponse)(many=True)

    @override
    @is_authorized(PermissionType.GET, Permission.SERVICES_COMPONENT)
    @handle_api_error
    def get(self) -> Response:
        data = self._get_schema.dump(self._get_schema.load(request.args))

        stmt = select(self.model)
        if data.get("contract_agreement_id"):
            stmt = stmt.where(self.model.contract_agreement_id == data.get("contract_agreement_id"))

        result = current_app.db_session.execute(stmt).all()
        response = make_response_with_headers(self._response_schema_collection.dump([sc[0] for sc in result]))

        return response

    @override
    @is_authorized(PermissionType.POST, Permission.SERVICES_COMPONENT)
    @handle_api_error
    def post(self) -> Response:
        message_prefix = f"POST to {ENDPOINT_STRING}"
        with OpsEventHandler(OpsEventType.CREATE_SERVICES_COMPONENT) as meta:
            self._post_schema.context["method"] = "POST"

            data = self._post_schema.dump(self._post_schema.load(request.json))
            data["period_start"] = date.fromisoformat(data["period_start"]) if data.get("period_start") else None
            data["period_end"] = date.fromisoformat(data["period_end"]) if data.get("period_end") else None

            new_sc = ServicesComponent(**data)

            token = verify_jwt_in_request()
            user = get_user_from_token(token[1])
            new_sc.created_by = user.id

            current_app.db_session.add(new_sc)
            current_app.db_session.commit()

            new_sc_dict = self._response_schema.dump(new_sc)
            meta.metadata.update({"new_sc": new_sc_dict})
            current_app.logger.info(f"{message_prefix}: New BLI created: {new_sc_dict}")

            return make_response_with_headers(new_sc_dict, 201)
