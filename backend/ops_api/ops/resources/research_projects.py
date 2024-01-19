from datetime import date, datetime
from typing import Optional

from flask import Response, current_app, request
from flask_jwt_extended import verify_jwt_in_request
from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from models import CAN, Agreement, BudgetLineItem, MethodologyType, OpsEventType, PopulationType, ProjectType, User
from models.base import BaseModel
from models.cans import CANFiscalYear
from models.projects import ResearchProject
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI, handle_api_error
from ops_api.ops.utils.auth import Permission, PermissionType, is_authorized
from ops_api.ops.utils.events import OpsEventHandler
from ops_api.ops.utils.query_helpers import QueryHelper
from ops_api.ops.utils.response import make_response_with_headers
from ops_api.ops.utils.user import get_user_from_token
from sqlalchemy.exc import PendingRollbackError, SQLAlchemyError
from sqlalchemy.future import select
from typing_extensions import List, override

ENDPOINT_STRING = "/research-projects"


class TeamLeaders(Schema):
    id: int = fields.Int()
    full_name: Optional[str] = fields.String()
    email: Optional[str] = fields.String()


class RequestBody(Schema):
    project_type: ProjectType = EnumField(ProjectType)
    title: str = fields.String()
    short_title: str = fields.String()
    description: Optional[str] = fields.String(allow_none=True)
    url: Optional[str] = fields.String(allow_none=True)
    origination_date: Optional[date] = fields.Date(format="%Y-%m-%d", default=None)

    methodologies: Optional[list[MethodologyType]] = fields.List(
        fields.Enum(MethodologyType),
        default=[],
    )
    populations: Optional[list[PopulationType]] = fields.List(
        fields.Enum(PopulationType),
        default=[],
    )
    team_leaders: Optional[list[TeamLeaders]] = fields.List(
        fields.Nested(TeamLeaders),
        default=[],
    )


class ResearchProjectResponse(Schema):
    id: int = fields.Int()
    title: str = fields.String()
    created_by: int = fields.Int()
    short_title: str = fields.String()
    description: Optional[str] = fields.String(allow_none=True)
    url: Optional[str] = fields.String(allow_none=True)
    origination_date: Optional[date] = fields.Date(format="%Y-%m-%d", default=None)
    methodologies: Optional[list[MethodologyType]] = fields.List(fields.Enum(MethodologyType), default=[])
    populations: Optional[list[PopulationType]] = fields.List(fields.Enum(PopulationType), default=[])
    team_leaders: Optional[list[TeamLeaders]] = fields.List(fields.Nested(TeamLeaders), default=[])
    created_on: datetime = fields.DateTime(format="%Y-%m-%dT%H:%M:%S.%fZ")
    updated_on: datetime = fields.DateTime(format="%Y-%m-%dT%H:%M:%S.%fZ")


class ResearchProjectItemAPI(BaseItemAPI):
    _response_schema = ResearchProjectResponse()

    def __init__(self, model: BaseModel = ResearchProject):
        super().__init__(model)

    @override
    @is_authorized(PermissionType.GET, Permission.RESEARCH_PROJECT)
    @handle_api_error
    def get(self, id: int) -> Response:
        item = self._get_item(id)
        if item:
            return make_response_with_headers(ResearchProjectItemAPI._response_schema.dump(item))
        else:
            return make_response_with_headers({}, 404)


class ResearchProjectListAPI(BaseListAPI):
    _post_schema = RequestBody()
    _response_schema = ResearchProjectResponse()

    def __init__(self, model: BaseModel = ResearchProject):
        super().__init__(model)

    @override
    @staticmethod
    def _get_query(fiscal_year=None, portfolio_id=None, search=None):
        stmt = (
            select(ResearchProject)
            .distinct(ResearchProject.id)
            .join(Agreement, isouter=True)
            .join(BudgetLineItem, isouter=True)
            .join(CAN, isouter=True)
            .join(CANFiscalYear, isouter=True)
        )

        query_helper = QueryHelper(stmt)

        if portfolio_id:
            query_helper.add_column_equals(CAN.managing_portfolio_id, portfolio_id)

        if fiscal_year:
            query_helper.add_column_equals(CANFiscalYear.fiscal_year, fiscal_year)

        if search is not None and len(search) == 0:
            query_helper.return_none()
        elif search:
            query_helper.add_search(ResearchProject.title, search)

        stmt = query_helper.get_stmt()
        current_app.logger.debug(f"SQL: {stmt}")

        return stmt

    @override
    @is_authorized(PermissionType.GET, Permission.RESEARCH_PROJECT)
    def get(self) -> Response:
        fiscal_year = request.args.get("fiscal_year")
        portfolio_id = request.args.get("portfolio_id")
        search = request.args.get("search")

        stmt = ResearchProjectListAPI._get_query(fiscal_year, portfolio_id, search)

        result = current_app.db_session.execute(stmt).all()

        project_response: List[dict] = []
        for item in result:
            for project in item:
                project_response.append(ResearchProjectListAPI._response_schema.dump(project))

        return make_response_with_headers(project_response)

    @override
    @is_authorized(PermissionType.POST, Permission.RESEARCH_PROJECT)
    def post(self) -> Response:
        try:
            with OpsEventHandler(OpsEventType.CREATE_PROJECT) as meta:
                errors = ResearchProjectListAPI._post_schema.validate(request.json)

                if errors:
                    current_app.logger.error(f"POST to {ENDPOINT_STRING}: Params failed validation: {errors}")
                    raise RuntimeError(f"POST to {ENDPOINT_STRING}: Params failed validation: {errors}")

                data = ResearchProjectListAPI._post_schema.load(request.json)
                new_rp = ResearchProject(**data)

                new_rp.team_leaders = [
                    current_app.db_session.get(User, tl_id["id"]) for tl_id in data.get("team_leaders", [])
                ]

                token = verify_jwt_in_request()
                user = get_user_from_token(token[1])
                new_rp.created_by = user.id

                current_app.db_session.add(new_rp)
                current_app.db_session.commit()

                new_rp_dict = ResearchProjectListAPI._response_schema.dump(new_rp)
                meta.metadata.update({"New RP": new_rp_dict})
                current_app.logger.info(f"POST to {ENDPOINT_STRING}: New ResearchProject created: {new_rp_dict}")

                return make_response_with_headers(new_rp_dict, 201)
        except (RuntimeError, PendingRollbackError) as re:
            # This is most likely the user's fault, e.g. a bad CAN or Agreement ID
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: {re}")
            return make_response_with_headers({}, 400)
        except SQLAlchemyError as se:
            current_app.logger.error(f"POST to {ENDPOINT_STRING}: {se}")
            return make_response_with_headers({}, 500)
