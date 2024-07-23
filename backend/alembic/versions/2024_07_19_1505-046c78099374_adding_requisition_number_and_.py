"""Adding requisition number and requisition date to BLI

Revision ID: 046c78099374
Revises: f8ef3a3d90d7
Create Date: 2024-07-19 15:05:23.462440+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from alembic_postgresql_enum import TableReference

# revision identifiers, used by Alembic.
revision: str = '046c78099374'
down_revision: Union[str, None] = 'f8ef3a3d90d7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('budget_line_item', sa.Column('requisition_number', sa.Integer(), nullable=True))
    op.add_column('budget_line_item', sa.Column('requisition_date', sa.Date(), nullable=True))
    op.add_column('budget_line_item_version', sa.Column('requisition_number', sa.Integer(), autoincrement=False, nullable=True))
    op.add_column('budget_line_item_version', sa.Column('requisition_date', sa.Date(), autoincrement=False, nullable=True))
    op.sync_enum_values('ops', 'opseventtype', ['LOGIN_ATTEMPT', 'CREATE_BLI', 'UPDATE_BLI', 'DELETE_BLI', 'CREATE_PROJECT', 'CREATE_NEW_AGREEMENT', 'UPDATE_AGREEMENT', 'SEND_BLI_FOR_APPROVAL', 'DELETE_AGREEMENT', 'ACKNOWLEDGE_NOTIFICATION', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER', 'CREATE_BLI_PACKAGE', 'UPDATE_BLI_PACKAGE', 'CREATE_SERVICES_COMPONENT', 'UPDATE_SERVICES_COMPONENT', 'DELETE_SERVICES_COMPONENT', 'CREATE_PROCUREMENT_ACQUISITION_PLANNING', 'UPDATE_PROCUREMENT_ACQUISITION_PLANNING', 'DELETE_PROCUREMENT_ACQUISITION_PLANNING', 'CREATE_DOCUMENT'],
                        [TableReference(table_schema='ops', table_name='ops_event', column_name='event_type'), TableReference(table_schema='ops', table_name='ops_event_version', column_name='event_type')],
                        enum_values_to_rename=[])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.sync_enum_values('ops', 'opseventtype', ['LOGIN_ATTEMPT', 'CREATE_BLI', 'UPDATE_BLI', 'DELETE_BLI', 'CREATE_PROJECT', 'CREATE_NEW_AGREEMENT', 'UPDATE_AGREEMENT', 'SEND_BLI_FOR_APPROVAL', 'DELETE_AGREEMENT', 'ACKNOWLEDGE_NOTIFICATION', 'LOGOUT', 'CREATE_USER', 'UPDATE_USER', 'DEACTIVATE_USER', 'CREATE_BLI_PACKAGE', 'UPDATE_BLI_PACKAGE', 'CREATE_SERVICES_COMPONENT', 'UPDATE_SERVICES_COMPONENT', 'DELETE_SERVICES_COMPONENT', 'CREATE_PROCUREMENT_ACQUISITION_PLANNING', 'UPDATE_PROCUREMENT_ACQUISITION_PLANNING', 'DELETE_PROCUREMENT_ACQUISITION_PLANNING'],
                        [TableReference(table_schema='ops', table_name='ops_event', column_name='event_type'), TableReference(table_schema='ops', table_name='ops_event_version', column_name='event_type')],
                        enum_values_to_rename=[])
    op.drop_column('budget_line_item_version', 'requisition_date')
    op.drop_column('budget_line_item_version', 'requisition_number')
    op.drop_column('budget_line_item', 'requisition_date')
    op.drop_column('budget_line_item', 'requisition_number')
    # ### end Alembic commands ###