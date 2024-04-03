from flask import Response, jsonify, request

from models.base import BaseModel
from ops_api.ops.base_views import BaseListAPI, handle_api_error
from ops_api.ops.utils.auth_views import login, logout, refresh
from ops_api.ops.utils.response import make_response_with_headers


class AuthLoginAPI(BaseListAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @handle_api_error
    def post(self) -> Response:
        errors = self.validator.validate(self, request.json)

        if errors:
            return make_response_with_headers(errors, 400)

        try:
            return login()
        except Exception as ex:
            return make_response_with_headers(f"Login Error: {ex}", 400)


class AuthLogoutAPI(BaseListAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @handle_api_error
    def post(self) -> Response:
        errors = self.validator.validate(self, request.json)

        if errors:
            return make_response_with_headers(errors, 400)

        try:
            return logout()
        except Exception as ex:
            return make_response_with_headers(f"Logout Error: {ex}", 400)


class AuthRefreshAPI(BaseListAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @handle_api_error
    def post(self) -> Response:
        errors = self.validator.validate(self, request.json)

        if errors:
            return jsonify(errors), 400

        return refresh()
