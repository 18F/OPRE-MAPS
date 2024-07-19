"""Switching appropriation_term from a column to a calculated property

Revision ID: 4bbe5ac187f2
Revises: aa5783297a09
Create Date: 2024-07-12 15:03:11.979370+00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '4bbe5ac187f2'
down_revision: Union[str, None] = 'aa5783297a09'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('can', 'appropriation_term')
    op.drop_column('can_version', 'appropriation_term')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('can_version', sa.Column('appropriation_term', sa.INTEGER(), autoincrement=False, nullable=True))
    op.add_column('can', sa.Column('appropriation_term', sa.INTEGER(), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
