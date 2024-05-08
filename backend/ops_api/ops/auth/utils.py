import json
import time
import uuid
from typing import Any, Optional
from uuid import UUID

import requests
from authlib.jose import jwt as jose_jwt
from flask import Config, current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import User
from ops_api.ops.auth.auth_types import UserInfoDict
from ops_api.ops.auth.exceptions import PrivateKeyError


def create_oauth_jwt(
    provider: str,
    config: Config,
    key: Optional[str] = None,
    header: Optional[str] = None,
    payload: Optional[dict[str, Any]] = None,
) -> str:
    """
    Returns an Access Token JWS from the configured OAuth Client
    :param provider: REQUIRED - The provider to use for the JWS
    :param config: REQUIRED - The configuration object for the application
    :param key: OPTIONAL - Private Key used for encoding the JWS
    :param header: OPTIONAL - JWS Header containing algorithm type
    :param payload: OPTIONAL - Contains the JWS payload
    :return: JsonWebSignature
    """
    jwt_private_key = key or config.get("JWT_PRIVATE_KEY")
    if not jwt_private_key:
        raise PrivateKeyError("Private Key not found in the configuration")

    expire = config["JWT_ACCESS_TOKEN_EXPIRES"]

    _payload = payload or {
        "iss": config["AUTHLIB_OAUTH_CLIENTS"][provider]["client_id"],
        "sub": config["AUTHLIB_OAUTH_CLIENTS"][provider]["client_id"],
        "aud": config["AUTHLIB_OAUTH_CLIENTS"][provider]["aud"],
        "jti": str(uuid.uuid4()),
        "exp": int(time.time()) + expire.seconds,
        "sso": provider,
    }
    _header = header or {"alg": "RS256"}

    jws = jose_jwt.encode(header=_header, payload=_payload, key=jwt_private_key)
    return jws


def get_jwks(provider_metadata_url: str) -> str:
    """
    See: https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets
    """
    provider_uris = json.loads(
        requests.get(
            provider_metadata_url,
            headers={"Accept": "application/json"},
        ).content.decode("utf-8")
    )

    jwks_uri = provider_uris["jwks_uri"]
    jwks = requests.get(jwks_uri).content.decode("utf-8")
    return jwks


def get_user_from_userinfo(user_info: UserInfoDict, session: Session) -> Optional[User]:
    """
    Get a user from the database using the user information
    :param user_info: REQUIRED - The user information to search for
    :param session: REQUIRED - The database session
    :return: User
    """
    user = session.scalars(select(User).where((User.oidc_id == user_info.get("sub")))).one_or_none()  # type: ignore
    if user:
        return user
    user = session.scalars(select(User).where((User.email == user_info.get("email")))).one_or_none()  # type: ignore
    return user


def update_user_from_userinfo(user: User, user_info: UserInfoDict, session: Session) -> None:
    """
    Update a user in the database using the user information
    :param user: REQUIRED - The user to update
    :param user_info: REQUIRED - The user information to update
    """
    user.first_name = user_info.get("given_name")
    user.last_name = user_info.get("family_name")
    user.hhs_id = user_info.get("hhsid")
    user.email = user_info.get("email")
    user.oidc_id = UUID(user_info.get("sub"))

    current_app.logger.debug(f"Updating User: {user.to_dict()}")

    session.add(user)
    session.commit()


def get_user(user_info: UserInfoDict, session: Session) -> User | None:
    """
    Get a user from the database by user data
    :param user_data: REQUIRED - The user data to search for
    :param session: REQUIRED - The database session
    :return: User.
    """
    user = get_user_from_userinfo(user_info, session)
    if user:
        update_user_from_userinfo(user, user_info, session)
        return user


def _get_token_and_user_data_from_internal_auth(
    user_data: UserInfoDict, config: Config, session: Session
) -> tuple[str, str, User]:
    """
    Generate internal backend-JWT.
    """

    user = get_user(user_data, session)

    # The next two tokens are specific to our backend API, these are used for our API
    # authZ, given a valid login from the prior AuthN steps above.

    additional_claims = {}
    if user.roles:
        additional_claims["roles"] = [role.name for role in user.roles]
    access_token = create_access_token(
        identity=user,
        expires_delta=config.get("JWT_ACCESS_TOKEN_EXPIRES"),
        additional_claims=additional_claims,
        fresh=True,
    )
    refresh_token = create_refresh_token(
        identity=user,
        expires_delta=config.get("JWT_REFRESH_TOKEN_EXPIRES"),
        additional_claims=additional_claims,
    )
    return access_token, refresh_token, user


def is_token_expired(token: str, secret_key: str) -> bool:
    data = jose_jwt.decode(token, secret_key)
    exp = data.get("exp")
    current_timestamp = time.time()
    current_app.logger.debug(f"Token Expiration: {exp} Current Time: {current_timestamp}")
    return exp < current_timestamp
