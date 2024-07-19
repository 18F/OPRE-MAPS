"""Adding ModType to BLI

Revision ID: a4a04f1f868e
Revises: 728fdb666cb2
Create Date: 2024-07-17 19:33:39.134098+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a4a04f1f868e'
down_revision: Union[str, None] = '728fdb666cb2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    sa.Enum('ADMIN', 'AMOUNT_TBD', 'AS_IS', 'REPLACEMENT_AMOUNT_FINAL', name='modtype').create(op.get_bind())
    op.add_column('budget_line_item', sa.Column('mod_type', postgresql.ENUM('ADMIN', 'AMOUNT_TBD', 'AS_IS', 'REPLACEMENT_AMOUNT_FINAL', name='modtype', create_type=False), nullable=True))
    op.add_column('budget_line_item_version', sa.Column('mod_type', postgresql.ENUM('ADMIN', 'AMOUNT_TBD', 'AS_IS', 'REPLACEMENT_AMOUNT_FINAL', name='modtype', create_type=False), autoincrement=False, nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('budget_line_item_version', 'mod_type')
    op.drop_column('budget_line_item', 'mod_type')
    sa.Enum('ADMIN', 'AMOUNT_TBD', 'AS_IS', 'REPLACEMENT_AMOUNT_FINAL', name='modtype').drop(op.get_bind())
    # ### end Alembic commands ###