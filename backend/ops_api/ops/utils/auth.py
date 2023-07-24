from enum import auto, Enum
from functools import wraps
import time
import uuid
from typing import Callable, Optional

from authlib.integrations.flask_client import OAuth
from authlib.jose import jwt as jose_jwt
from flask import current_app, Response
from flask_jwt_extended import JWTManager, get_jwt_identity, jwt_required
from models.users import User
from ops_api.ops.utils.response import make_response_with_headers
from ops_api.ops.utils.authorization import AuthorizationGateway, BasicAuthorizationPrivider
from sqlalchemy import select

jwtMgr = JWTManager()
oauth = OAuth()
auth_gateway = AuthorizationGateway(BasicAuthorizationPrivider())


class PermissionType(Enum):
    GET = auto()
    PUT = auto()
    PATCH = auto()
    DELETE = auto()
    POST = auto()


class Permission(Enum):
    AGREEMENT = auto()
    BUDGET_LINE_ITEM = auto()
    CAN = auto()
    DIVISION = auto()
    NOTIFICATION = auto()
    PORTFOLIO = auto()
    RESEARCH_PROJECT = auto()
    USER = auto()


@jwtMgr.user_identity_loader
def user_identity_lookup(user: User) -> str:
    return user.oidc_id


@jwtMgr.user_lookup_loader
def user_lookup_callback(_jwt_header: dict, jwt_data: dict) -> Optional[User]:
    identity = jwt_data["sub"]
    stmt = select(User).where(User.oidc_id == identity)
    users = current_app.db_session.execute(stmt).all()
    if users and len(users) == 1:
        return users[0][0]
    return None


def create_oauth_jwt(
    key: Optional[str] = None,
    header: Optional[str] = None,
    payload: Optional[str] = None,
) -> str:
    """
    Returns an Access Token JWS from the configured OAuth Client
    :param key: OPTIONAL - Private Key used for encoding the JWS
    :param header: OPTIONAL - JWS Header containing algorithm type
    :param payload: OPTIONAL - Contains the JWS payload
    :return: JsonWebSignature
    """
    jwt_private_key = key or current_app.config.get("JWT_PRIVATE_KEY")
    if not jwt_private_key:
        raise NotImplementedError

    expire = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]

    # client_id = current_app.config["AUTHLIB_OAUTH_CLIENTS"]["logingov"]["client_id"]
    _payload = payload or {
        "iss": current_app.config["AUTHLIB_OAUTH_CLIENTS"]["logingov"]["client_id"],
        "sub": current_app.config["AUTHLIB_OAUTH_CLIENTS"]["logingov"]["client_id"],
        "aud": "https://idp.int.identitysandbox.gov/api/openid_connect/token",
        "jti": str(uuid.uuid4()),
        "exp": int(time.time()) + expire.seconds,
    }
    _header = header or {"alg": "RS256"}
    jws = jose_jwt.encode(header=_header, payload=_payload, key=jwt_private_key)
    return jws


class is_authorized:
    def __init__(
        self, permission_type: PermissionType, permission: Permission, extra_check: Optional[Callable[..., bool]] = None
    ) -> None:
        self.permission_type = permission_type
        self.permission = permission
        self.extra_check = extra_check

    def __call__(self, func: Callable) -> Callable:
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs) -> Response:
            identity = get_jwt_identity()
            is_authorized = auth_gateway.is_authorized(identity, f"{self.permission_type}_{self.permission}".upper())
            extra_valid = True
            if self.extra_check is not None:
                extra_valid = self.extra_check(*args, **kwargs)

            if is_authorized and extra_valid:
                response = func(*args, **kwargs)
            else:
                response = make_response_with_headers({}, 401)

            return response

        return wrapper
