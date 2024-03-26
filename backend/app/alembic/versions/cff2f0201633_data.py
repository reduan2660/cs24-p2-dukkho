"""Data

Revision ID: cff2f0201633
Revises: 04281393d383
Create Date: 2024-03-26 10:14:20.937622

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

import os
from app.config import HASHED_SUPERADMIN_PASSWORD

from dotenv import load_dotenv
load_dotenv()


# revision identifiers, used by Alembic.
revision: str = 'cff2f0201633'
down_revision: Union[str, None] = '04281393d383'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    meta = sa.MetaData()
    
    
    # Data
    roles_tbl = sa.Table('roles', meta, autoload_with=op.get_bind())
    op.bulk_insert(roles_tbl, [
        {"id": 0, "name": "Unassigned"},
        {"id": 1, "name": "System Admin"},
        {"id": 2, "name": "STS Manager"},
        {"id": 3, "name": "Landfill Manager"},
    ])

    permissions_tbl = sa.Table('permissions', meta, autoload_with=op.get_bind())
    op.bulk_insert(permissions_tbl, [
        {"id": 0, "name": "create_user", "category": "user"}
    ])

    roles_permissions_tbl = sa.Table('roles_permissions', meta, autoload_with=op.get_bind())
    op.bulk_insert(roles_permissions_tbl, [
        {"id": 0, "role_id": 1, "permission_id": 0}
    ])

    users_tbl = sa.Table('users', meta, autoload_with=op.get_bind())
    op.bulk_insert(users_tbl, [
        {"id": 0, "name": "System Admin", "email": "admin@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 1}
    ])


def downgrade() -> None:
    op.execute("DELETE FROM users")
    op.execute("DELETE FROM roles_permissions")
    op.execute("DELETE FROM permissions")
    op.execute("DELETE FROM roles") 
