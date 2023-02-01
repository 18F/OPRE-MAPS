import time
import uuid
from typing import Optional

from authlib.integrations.flask_client import OAuth
from authlib.jose import jwt
from flask import current_app
from flask_jwt_extended import JWTManager
from models.users import User

jwtMgr = JWTManager()
oauth = OAuth()


@jwtMgr.user_identity_loader
def user_identity_lookup(user: User) -> str:
    return user.username


@jwtMgr.user_lookup_loader
def user_lookup_callback(_jwt_header: dict, jwt_data: dict) -> Optional[User]:
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).one_or_none()


def get_jwt(key: Optional[str] = None) -> str:
    jwt_private_key = current_app.config.get("JWT_PRIVATE_KEY") or key
    if not jwt_private_key:
        raise NotImplementedError

    client_id = current_app.config["AUTHLIB_OAUTH_CLIENTS"]["logingov"]["client_id"]
    payload = {
        "iss": client_id,
        "sub": client_id,
        "aud": "https://idp.int.identitysandbox.gov/api/openid_connect/token",
        "jti": str(uuid.uuid4()),
        "exp": int(time.time()) + 300,
    }
    header = {"alg": "RS256"}
    jws = jwt.encode(header, payload, jwt_private_key)

    return jws
