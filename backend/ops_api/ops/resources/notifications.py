from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, cast

import desert
import marshmallow_dataclass as mmdc
from flask import Response, current_app, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError
from models import Notification, OpsEventType, User
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI
from ops_api.ops.utils.events import OpsEventHandler
from ops_api.ops.utils.query_helpers import QueryHelper
from ops_api.ops.utils.response import make_response_with_headers
from sqlalchemy import select
from sqlalchemy.exc import PendingRollbackError, SQLAlchemyError
from sqlalchemy.orm import InstrumentedAttribute
from typing_extensions import override

ENDPOINT_STRING = "/notifications"


@dataclass()
class UpdateSchema:
    is_read: Optional[bool] = None
    title: Optional[str] = None
    message: Optional[str] = None
    recipient_id: Optional[int] = None


@dataclass
class Recipient:
    id: int
    oidc_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None


@dataclass
class NotificationResponse:
    id: int
    is_read: bool
    created_by: int
    updated_by: int
    created_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%f"})
    updated_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%f"})
    title: Optional[str] = None
    message: Optional[str] = None
    recipient: Optional[Recipient] = None


@dataclass
class ListAPIRequest:
    user_id: Optional[str]
    oidc_id: Optional[str]
    is_read: Optional[bool]


class NotificationItemAPI(BaseItemAPI):
    def __init__(self, model):
        super().__init__(model)
        self._response_schema = mmdc.class_schema(NotificationResponse)()
        self._put_schema = mmdc.class_schema(UpdateSchema)()
        self._patch_schema = mmdc.class_schema(UpdateSchema)()

    def _get_item_with_try(self, id: int) -> Response:
        try:
            item = self._get_item(id)

            if item:
                response = make_response_with_headers(self._response_schema.dump(item))
            else:
                response = make_response_with_headers({}, 404)
        except SQLAlchemyError as se:
            current_app.logger.error(se)
            response = make_response_with_headers({}, 500)

        return response

    @override
    @jwt_required()
    def get(self, id: int) -> Response:
        identity = get_jwt_identity()
        is_authorized = self.auth_gateway.is_authorized(identity, ["GET_NOTIFICATION"])

        if is_authorized:
            response = self._get_item_with_try(id)
        else:
            response = make_response_with_headers({}, 401)

        return response

    @override
    @jwt_required()
    def put(self, id: int) -> Response:
        message_prefix = f"PUT to {ENDPOINT_STRING}"
        try:
            notification_dict = self.put_notification(id, message_prefix)
            return make_response_with_headers(notification_dict, 200)
        except (KeyError, RuntimeError, PendingRollbackError) as re:
            current_app.logger.error(f"{message_prefix}: {re}")
            return make_response_with_headers({}, 400)
        except ValidationError as ve:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"{message_prefix}: {ve}")
            return make_response_with_headers(ve.normalized_messages(), 400)
        except SQLAlchemyError as se:
            current_app.logger.error(f"{message_prefix}: {se}")
            return make_response_with_headers({}, 500)

    def put_notification(self, id: int, message_prefix: str):
        existing_notification = current_app.db_session.get(Notification, id)
        if existing_notification and not existing_notification.is_read and request.json.get("is_read"):
            with OpsEventHandler(OpsEventType.ACKNOWLEDGE_NOTIFICATION) as meta:
                notification_dict = self.handle_put(existing_notification, message_prefix, meta)
        else:
            notification_dict = self.handle_put(existing_notification, message_prefix)
        return notification_dict

    def handle_put(
        self,
        existing_notification: Notification,
        message_prefix: str,
        meta: Optional[OpsEventHandler] = None,
    ):
        data = self._put_schema.dump(self._put_schema.load(request.json))
        for item in data:
            setattr(existing_notification, item, data[item])
        current_app.db_session.add(existing_notification)
        current_app.db_session.commit()
        notification_dict = self._response_schema.dump(existing_notification)
        if meta:
            meta.metadata.update({"notification": notification_dict})
        current_app.logger.info(f"{message_prefix}: Notification Updated: {notification_dict}")
        return notification_dict

    @override
    @jwt_required()
    def patch(self, id: int) -> Response:
        message_prefix = f"PATCH to {ENDPOINT_STRING}"
        try:
            notification_dict = self.patch_notification(id, message_prefix)
            return make_response_with_headers(notification_dict, 200)
        except (KeyError, RuntimeError, PendingRollbackError) as re:
            current_app.logger.error(f"{message_prefix}: {re}")
            return make_response_with_headers({}, 400)
        except ValidationError as ve:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"{message_prefix}: {ve}")
            return make_response_with_headers(ve.normalized_messages(), 400)
        except SQLAlchemyError as se:
            current_app.logger.error(f"{message_prefix}: {se}")
            return make_response_with_headers({}, 500)

    def patch_notification(self, id: int, message_prefix: str):
        existing_notification = current_app.db_session.get(Notification, id)
        if existing_notification and not existing_notification.is_read and request.json.get("is_read"):
            with OpsEventHandler(OpsEventType.ACKNOWLEDGE_NOTIFICATION) as meta:
                notification_dict = self.handle_patch(existing_notification, message_prefix, meta)
        else:
            notification_dict = self.handle_patch(existing_notification, message_prefix)
        return notification_dict

    def handle_patch(
        self,
        existing_notification: Notification,
        message_prefix: str,
        meta: Optional[OpsEventHandler] = None,
    ):
        data = self._patch_schema.dump(self._patch_schema.load(request.json))
        data = {k: v for (k, v) in data.items() if k in request.json}  # only keep the attributes from the request body
        for item in data:
            setattr(existing_notification, item, data[item])
        current_app.db_session.add(existing_notification)
        current_app.db_session.commit()
        notification_dict = self._response_schema.dump(existing_notification)
        if meta:
            meta.metadata.update({"notification": notification_dict})
        current_app.logger.info(f"{message_prefix}: Notification Updated: {notification_dict}")
        return notification_dict


class NotificationListAPI(BaseListAPI):
    def __init__(self, model):
        super().__init__(model)
        self._get_input_schema = desert.schema(ListAPIRequest)
        self._response_schema_collection = mmdc.class_schema(NotificationResponse)(many=True)

    @staticmethod
    def _get_query(
        user_id: Optional[int] = None,
        oidc_id: Optional[str] = None,
        is_read: Optional[bool] = None,
    ):
        stmt = (
            select(Notification)
            .distinct(Notification.id)
            .join(User, Notification.recipient_id == User.id, isouter=True)
            .order_by(Notification.id)
        )

        query_helper = QueryHelper(stmt)

        if user_id is not None and len(user_id) == 0:
            query_helper.return_none()
        elif user_id:
            query_helper.add_column_equals(cast(InstrumentedAttribute, User.id), user_id)

        if oidc_id is not None and len(oidc_id) == 0:
            query_helper.return_none()
        elif oidc_id:
            query_helper.add_column_equals(cast(InstrumentedAttribute, User.oidc_id), oidc_id)

        if is_read is not None:
            query_helper.add_column_equals(cast(InstrumentedAttribute, Notification.is_read), is_read)

        stmt = query_helper.get_stmt()
        current_app.logger.debug(f"SQL: {stmt}")

        return stmt

    @jwt_required()
    def get(self) -> Response:
        errors = self._get_input_schema.validate(request.args)

        if errors:
            return make_response_with_headers(errors, 400)

        request_data: ListAPIRequest = self._get_input_schema.load(request.args)
        stmt = self._get_query(
            user_id=request_data.user_id,
            oidc_id=request_data.oidc_id,
            is_read=request_data.is_read,
        )
        result = current_app.db_session.execute(stmt).all()
        return make_response_with_headers(self._response_schema_collection.dump([item[0] for item in result]))
