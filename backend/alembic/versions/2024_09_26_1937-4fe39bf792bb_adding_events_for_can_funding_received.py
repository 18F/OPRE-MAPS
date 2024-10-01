"""Adding events for Can Funding Received

Revision ID: 4fe39bf792bb
Revises: cbbaf27a11ee
Create Date: 2024-09-26 19:37:29.658972+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from alembic_postgresql_enum import TableReference

# revision identifiers, used by Alembic.
revision: str = '4fe39bf792bb'
down_revision: Union[str, None] = 'd5610e0988b0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.sync_enum_values('ops', 'opseventtype', ['CREATE_BLI', 'UPDATE_BLI', 'DELETE_BLI', 'SEND_BLI_FOR_APPROVAL', 'CREATE_PROJECT', 'CREATE_NEW_AGREEMENT', 'UPDATE_AGREEMENT', 'DELETE_AGREEMENT', 'CREATE_NEW_CAN', 'UPDATE_CAN', 'DELETE_CAN', 'CREATE_CAN_FUNDING_RECEIVED', 'UPDATE_CAN_FUNDING_RECEIVED', 'DELETE_CAN_FUNDING_RECEIVED', 'ACKNOWLEDGE_NOTIFICATION', 'CREATE_BLI_PACKAGE', 'UPDATE_BLI_PACKAGE', 'CREATE_SERVICES_COMPONENT', 'UPDATE_SERVICES_COMPONENT', 'DELETE_SERVICES_COMPONENT', 'CREATE_PROCUREMENT_ACQUISITION_PLANNING', 'UPDATE_PROCUREMENT_ACQUISITION_PLANNING', 'DELETE_PROCUREMENT_ACQUISITION_PLANNING', 'CREATE_DOCUMENT', 'UPDATE_DOCUMENT', 'LOGIN_ATTEMPT', 'LOGOUT', 'GET_USER_DETAILS', 'CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER'],
                        [TableReference(table_schema='ops', table_name='ops_event', column_name='event_type'), TableReference(table_schema='ops', table_name='ops_event_version', column_name='event_type')],
                        enum_values_to_rename=[])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.sync_enum_values('ops', 'opseventtype', ['CREATE_BLI', 'UPDATE_BLI', 'DELETE_BLI', 'SEND_BLI_FOR_APPROVAL', 'CREATE_PROJECT', 'CREATE_NEW_AGREEMENT', 'UPDATE_AGREEMENT', 'DELETE_AGREEMENT', 'CREATE_NEW_CAN', 'UPDATE_CAN', 'DELETE_CAN', 'ACKNOWLEDGE_NOTIFICATION', 'CREATE_BLI_PACKAGE', 'UPDATE_BLI_PACKAGE', 'CREATE_SERVICES_COMPONENT', 'UPDATE_SERVICES_COMPONENT', 'DELETE_SERVICES_COMPONENT', 'CREATE_PROCUREMENT_ACQUISITION_PLANNING', 'UPDATE_PROCUREMENT_ACQUISITION_PLANNING', 'DELETE_PROCUREMENT_ACQUISITION_PLANNING', 'CREATE_DOCUMENT', 'UPDATE_DOCUMENT', 'LOGIN_ATTEMPT', 'LOGOUT', 'GET_USER_DETAILS', 'CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER'],
                        [TableReference(table_schema='ops', table_name='ops_event', column_name='event_type'), TableReference(table_schema='ops', table_name='ops_event_version', column_name='event_type')],
                        enum_values_to_rename=[])
    # ### end Alembic commands ###
