from contextlib import contextmanager
from enum import Enum
from typing import Optional

from flask import Response, current_app, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required
from marshmallow import Schema, ValidationError
from models.base import BaseModel
from ops_api.ops.utils.auth import auth_gateway
from ops_api.ops.utils.errors import error_simulator
from ops_api.ops.utils.response import make_response_with_headers
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from typing_extensions import override


def generate_validator(model: BaseModel) -> BaseModel.Validator:
    try:
        return model.Validator()
    except AttributeError:
        return None


@contextmanager
def handle_sql_error():
    try:
        yield
    except SQLAlchemyError as se:
        current_app.logger.error(se)
        response = make_response_with_headers({}, 500)
        return response


class OPSMethodView(MethodView):
    init_every_request = False

    def __init__(self, model: BaseModel):
        self.model = model
        self.validator = generate_validator(model)
        self.auth_gateway = auth_gateway

    def _get_item_by_oidc(self, oidc: str):
        stmt = (
            select(self.model).where(self.model.oidc_id == oidc).order_by(self.model.id)
        )
        return current_app.db_session.scalar(stmt)

    def _get_item(self, id: int) -> BaseModel:
        stmt = select(self.model).where(self.model.id == id).order_by(self.model.id)
        return current_app.db_session.scalar(stmt)

    def _get_all_items(self) -> list[BaseModel]:
        stmt = select(self.model).order_by(self.model.id)
        # row objects containing 1 model instance each, need to unpack.
        return [row[0] for row in current_app.db_session.execute(stmt).all()]

    def _get_item_by_oidc_with_try(self, oidc: str):
        with handle_sql_error():
            item = self._get_item_by_oidc(oidc)

            if item:
                response = make_response_with_headers(item.to_dict())
            else:
                response = make_response_with_headers({}, 404)

            return response

    def _get_item_with_try(self, id: int) -> Response:
        with handle_sql_error():
            item = self._get_item(id)

            if item:
                response = make_response_with_headers(item.to_dict())
            else:
                response = make_response_with_headers({}, 404)

        return response

    def _get_all_items_with_try(self) -> Response:
        with handle_sql_error():
            item_list = self._get_all_items()

            if item_list:
                response = make_response_with_headers(
                    [item.to_dict() for item in item_list]
                )
            else:
                response = make_response_with_headers({}, 404)

        return response

    @staticmethod
    def _validate_request(schema: Schema, message: Optional[str] = "", partial=False):
        errors = schema.validate(request.json, partial=partial)
        if errors:
            current_app.logger.error(f"{message}: {errors}")
            raise ValidationError(errors)


class BaseItemAPI(OPSMethodView):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @override
    @jwt_required()
    @error_simulator
    def get(self, id: int) -> Response:
        return self._get_item_with_try(id)


class BaseListAPI(OPSMethodView):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @override
    @jwt_required()
    @error_simulator
    def get(self) -> Response:
        return self._get_all_items_with_try()

    @override
    @jwt_required()
    @error_simulator
    def post(self) -> Response:
        raise NotImplementedError


class EnumListAPI(MethodView):
    enum: Enum

    def __init_subclass__(self, enum: Enum, **kwargs):
        self.enum = enum
        super().__init_subclass__(**kwargs)

    def __init__(self, enum: Enum, **kwargs):
        super().__init__(**kwargs)

    @override
    @jwt_required()
    @error_simulator
    def get(self) -> Response:
        enum_items = {e.name: e.value for e in self.enum}  # type: ignore [attr-defined]
        return jsonify(enum_items)
