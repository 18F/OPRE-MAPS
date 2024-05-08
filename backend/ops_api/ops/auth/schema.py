from marshmallow import Schema, fields

from ops_api.ops.auth.auth_types import ProviderTypes


class LoginRequestSchema(Schema):
    code: str = fields.String(required=True)
    provider: ProviderTypes = fields.Enum(ProviderTypes, required=True)


class LoginResponseSchema(Schema):
    # user is also passed back in the response, but it is not defined here
    access_token: str = fields.String(required=True)
    refresh_token: str = fields.String(required=True)


class LogoutResponseSchema(Schema):
    message: str = fields.String(required=True)
