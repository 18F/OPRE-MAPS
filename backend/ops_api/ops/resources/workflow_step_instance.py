from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from flask import Response
from marshmallow_enum import EnumField
from typing_extensions import override

from models.base import BaseModel
from models.workflows import WorkflowStepInstance, WorkflowStepStatus
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI, handle_api_error
from ops_api.ops.utils.auth import Permission, PermissionType, is_authorized

ENDPOINT_STRING = "/workflow-step-instance"


@dataclass
class WorkflowStepInstanceResponse:
    id: int
    workflow_instance_id: Optional[int] = None
    workflow_step_template_id: Optional[int] = None
    status: Optional[WorkflowStepStatus] = EnumField(WorkflowStepStatus)
    notes: Optional[str] = None
    time_started: Optional[datetime] = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    time_completed: Optional[datetime] = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    created_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    updated_on: datetime = field(default=None, metadata={"format": "%Y-%m-%dT%H:%M:%S.%fZ"})
    created_by: Optional[int] = None
    # approvers: Optional[list[union[User, Group, Role]]] = fields.List(fields.Nested(User, Group, Role))


class WorkflowStepInstanceItemAPI(BaseItemAPI):
    def __init__(self, model: BaseModel = WorkflowStepInstance):
        super().__init__(model)
        # self._response_schema = desert.schema(WorkflowStepInstanceResponse)

    @override
    @is_authorized(PermissionType.GET, Permission.WORKFLOW)
    @handle_api_error
    def get(self, id: int) -> Response:
        return self._get_item_with_try(id)


class WorkflowStepInstanceListAPI(BaseListAPI):
    def __init__(self, model: BaseModel = WorkflowStepInstance):
        super().__init__(model)
        # self._response_schema = desert.schema(WorkflowStepInstanceResponse)

    @override
    @is_authorized(PermissionType.GET, Permission.WORKFLOW)
    @handle_api_error
    def get(self) -> Response:
        return super().get()
