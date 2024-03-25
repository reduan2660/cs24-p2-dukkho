"""Data

Revision ID: 34c3ba7cc84c
Revises: 542fdb703e5a
Create Date: 2024-03-26 02:07:05.263719

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

import os
from passlib.context import CryptContext

from dotenv import load_dotenv
load_dotenv()

# revision identifiers, used by Alembic.
revision: str = '34c3ba7cc84c'
down_revision: Union[str, None] = '542fdb703e5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# PASSWORD HASH
SECRET_KEY     = os.getenv("SECRET_KEY")
HASH_ALGORITHM = "HS256"
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
HASHED_SUPERADMIN_PASSWORD = pwd_context.hash(SUPERADMIN_PASSWORD)


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
    
    # Data
    op.execute("DELETE FROM users")
    op.execute("DELETE FROM roles_permissions")
    op.execute("DELETE FROM permissions")
    op.execute("DELETE FROM roles") 
