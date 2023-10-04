from contextlib import suppress

from flask import Response, current_app, request
from models.base import BaseData
from models.cans import ContractAgreement
from ops_api.ops.base_views import BaseItemAPI, BaseListAPI
from ops_api.ops.utils.auth import Permission, PermissionType, is_authorized
from ops_api.ops.utils.query_helpers import QueryHelper
from ops_api.ops.utils.response import make_response_with_headers
from sqlalchemy.future import select
from typing_extensions import override


class ContractItemAPI(BaseItemAPI):
    def __init__(self, model: BaseData = ContractAgreement):
        super().__init__(model)

    @override
    @is_authorized(PermissionType.GET, Permission.AGREEMENT)
    def get(self, id: int) -> Response:
        response = self._get_item_with_try(id)
        return response


class ContractListAPI(BaseListAPI):
    def __init__(self, model: BaseData = ContractAgreement):
        super().__init__(model)

    @staticmethod
    def _get_query(search=None, **kwargs):
        stmt = select(ContractAgreement).order_by(ContractAgreement.id)
        query_helper = QueryHelper(stmt)

        if search is not None and len(search) == 0:
            query_helper.return_none()
        elif search:
            query_helper.add_search(ContractAgreement.name, search)

        for key, value in kwargs.items():
            with suppress(AttributeError):
                query_helper.add_column_equals(getattr(ContractAgreement, key), value)

        stmt = query_helper.get_stmt()
        current_app.logger.debug(f"SQL: {stmt}")

        return stmt

    @override
    @is_authorized(PermissionType.GET, Permission.AGREEMENT)
    def get(self) -> Response:
        stmt = self._get_query(**request.args)

        result = current_app.db_session.execute(stmt).all()
        return make_response_with_headers([i.to_dict() for item in result for i in item])
