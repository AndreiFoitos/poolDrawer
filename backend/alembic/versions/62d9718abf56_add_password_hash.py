"""add password_hash to users

Revision ID: 62d9718abf56
Revises: 029763e4bd9d
Create Date: 2026-05-07

"""
from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "62d9718abf56"
down_revision: Union[str, Sequence[str], None] = "029763e4bd9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("password_hash", sa.String(), nullable=True),
    )

def downgrade() -> None:
    op.drop_column("users", "password_hash")