import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import Encoding, NoEncryption, PrivateFormat

from models import User, UserStatus
from models.events import OpsEventStatus, OpsEventType
from ops_api.ops.auth.auth import create_oauth_jwt


def test_auth_post_fails(client):
    data = {"provider": "fakeauth"}  # missing auth_code

    res = client.post("/auth/login/", json=data)
    assert res.status_code == 400


@pytest.mark.usefixtures("app_ctx")
def test_get_jwt_not_none(app):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    encoded = key.private_bytes(Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption())
    with app.test_request_context("/auth/login", method="POST", data={"provider": "fakeauth", "code": ""}):
        jwt = create_oauth_jwt("fakeauth", key=encoded)
        print(f"jwt: {jwt}")
        assert jwt is not None


def test_auth_post_fails_creates_event(client, loaded_db, mocker):
    mock_cm = mocker.patch("ops_api.ops.utils.events.Session")
    mock_session = mocker.MagicMock()
    mock_cm.return_value.__enter__.return_value = mock_session

    data = {"code": "abc123"}  # missing provider

    res = client.post("/auth/login/", json=data)
    print(f"response: {res.json}")
    assert res.status_code == 400


def test_auth_post_succeeds_creates_event(client, loaded_db, mocker):
    # setup mocks
    mock_cm = mocker.patch("ops_api.ops.utils.events.Session")
    mock_session = mocker.MagicMock()
    mock_cm.return_value.__enter__.return_value = mock_session

    m1 = mocker.patch("ops_api.ops.auth.service._get_token_and_user_data_from_oauth_provider")
    m1.return_value = ({"access_token": "admin_user"}, {})
    m2 = mocker.patch("ops_api.ops.auth.service._get_token_and_user_data_from_internal_auth")
    user = mocker.MagicMock()
    user.to_dict.return_value = {}
    m2.return_value = ("blah", "blah", user, False)

    # test
    res = client.post("/auth/login/", json={"provider": "fakeauth", "code": "admin_user"})
    assert res.status_code == 200

    event = mock_session.add.call_args[0][0]
    assert event.event_type == OpsEventType.LOGIN_ATTEMPT
    assert event.event_status == OpsEventStatus.SUCCESS
    assert event.event_details["access_token"] == "blah"


def test_login_succeeds_with_active_status(client, loaded_db, mocker):
    # setup mocks
    m1 = mocker.patch("ops_api.ops.auth.service._get_token_and_user_data_from_oauth_provider")
    m1.return_value = ({"access_token": "admin_user"}, {})
    m2 = mocker.patch("ops_api.ops.auth.service._get_token_and_user_data_from_internal_auth")
    user = mocker.MagicMock()
    user.to_dict.return_value = {}
    m2.return_value = ("blah", "blah", user, False)

    res = client.post("/auth/login/", json={"provider": "fakeauth", "code": "admin_user"})
    assert res.status_code == 200


def test_login_fails_with_inactive_status(client, loaded_db, mocker):
    m1 = mocker.patch("ops_api.ops.auth.authentication_gateway.get_user_from_token")
    m1.return_value = User(status=UserStatus.INACTIVE)

    # the JSON {"provider": "fakeauth", "code": "admin_user"} here is used as a stub to avoid the actual auth process
    res = client.post("/auth/login/", json={"provider": "fakeauth", "code": "admin_user"})
    assert res.status_code == 403


def test_login_fails_with_locked_status(client, loaded_db, mocker):
    m1 = mocker.patch("ops_api.ops.auth.authentication_gateway.get_user_from_token")
    m1.return_value = User(status=UserStatus.LOCKED)

    # the JSON {"provider": "fakeauth", "code": "admin_user"} here is used as a stub to avoid the actual auth process
    res = client.post("/auth/login/", json={"provider": "fakeauth", "code": "admin_user"})
    assert res.status_code == 403


def test_login_fails_with_null_status(client, loaded_db, mocker):
    m1 = mocker.patch("ops_api.ops.auth.authentication_gateway.get_user_from_token")
    m1.return_value = User(status=None)

    # the JSON {"provider": "fakeauth", "code": "admin_user"} here is used as a stub to avoid the actual auth process
    res = client.post("/auth/login/", json={"provider": "fakeauth", "code": "admin_user"})
    assert res.status_code == 403
