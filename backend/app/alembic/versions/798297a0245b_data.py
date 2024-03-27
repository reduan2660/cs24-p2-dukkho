"""Data

Revision ID: 798297a0245b
Revises: 4f841ae14e12
Create Date: 2024-03-28 00:13:39.633131

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '798297a0245b'
down_revision: Union[str, None] = '4f841ae14e12'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

from app.config import HASHED_SUPERADMIN_PASSWORD

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
        {"id": 0, "name": "create_user", "category": "user"},
        {"id": 1, "name": "list_all_users", "category": "user"},
        {"id": 2, "name": "delete_user", "category": "user"},

        {"id": 3, "name": "create_role", "category": "role"},
        {"id": 4, "name": "list_all_roles", "category": "role"},
        {"id": 5, "name": "view_role_permission", "category": "role"},
        {"id": 6, "name": "edit_role_permission", "category": "role"},
        {"id": 7, "name": "list_all_permissions", "category": "role"},
        {"id": 8, "name": "assign_role_to_user", "category": "role"},

        {"id": 9, "name": "list_all_sts", "category": "sts"},
        {"id": 10, "name": "create_sts", "category": "sts"},
        {"id": 11, "name": "delete_sts", "category": "sts"},
        {"id": 12, "name": "edit_sts", "category": "sts"},

        {"id": 13, "name": "list_landfill", "category": "landfill"},
        {"id": 14, "name": "create_landfill", "category": "landfill"},
        {"id": 15, "name": "edit_landfill", "category": "landfill"},
        {"id": 16, "name": "delete_landfill", "category": "landfill"},
    ])

    roles_permissions_tbl = sa.Table('roles_permissions', meta, autoload_with=op.get_bind())
    op.bulk_insert(roles_permissions_tbl, [
        
        # System Admin - User
        {"id": 0, "role_id": 1, "permission_id": 0},
        {"id": 1, "role_id": 1, "permission_id": 1},
        {"id": 2, "role_id": 1, "permission_id": 2},

        # System Admin - Role
        {"id": 3, "role_id": 1, "permission_id": 3},
        {"id": 4, "role_id": 1, "permission_id": 4},
        {"id": 5, "role_id": 1, "permission_id": 5},
        {"id": 6, "role_id": 1, "permission_id": 6},
        {"id": 7, "role_id": 1, "permission_id": 7},
        {"id": 8, "role_id": 1, "permission_id": 8},

        # System Admin - STS
        {"id": 9, "role_id": 1, "permission_id": 9},
        {"id": 10, "role_id": 1, "permission_id": 10},
        {"id": 11, "role_id": 1, "permission_id": 11},
        {"id": 12, "role_id": 1, "permission_id": 12},

        # System Admin - Landfill
        {"id": 13, "role_id": 1, "permission_id": 13},
        {"id": 14, "role_id": 1, "permission_id": 14},
        {"id": 15, "role_id": 1, "permission_id": 15},
        {"id": 16, "role_id": 1, "permission_id": 16},
        
    ])

    users_tbl = sa.Table('users', meta, autoload_with=op.get_bind())
    op.bulk_insert(users_tbl, [
        {"id": 0, "name": "System Admin", "email": "admin@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 1}
    ])


def downgrade() -> None:
    op.execute("DELETE FROM sessions")
    op.execute("DELETE FROM users")
    op.execute("DELETE FROM roles_permissions")
    op.execute("DELETE FROM permissions")
    op.execute("DELETE FROM roles") 