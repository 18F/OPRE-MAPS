from flask import Response

from models.base import BaseModel
from ops_api.ops.auth.decorators import check_user_session
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI, handle_api_error
from ops_api.ops.utils.auth import Permission, PermissionType, is_authorized

ENDPOINT_STRING = "/package-snapshot"


class PackageSnapshotItemAPI(BaseItemAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @handle_api_error
    @is_authorized(PermissionType.GET, Permission.WORKFLOW)
    @check_user_session
    def get(self, id: int) -> Response:
        return self._get_item_with_try(id)


class PackageSnapshotListAPI(BaseListAPI):
    def __init__(self, model: BaseModel):
        super().__init__(model)

    @handle_api_error
    @is_authorized(PermissionType.GET, Permission.WORKFLOW)
    @check_user_session
    def get(self) -> Response:
        return super().get()
