"""Data

Revision ID: 6257bc4cd9ab
Revises: c6efe9eea2b5
Create Date: 2024-03-30 03:03:50.971103

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6257bc4cd9ab'
down_revision: Union[str, None] = 'c6efe9eea2b5'
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
        {"id": 14, "name": "list_available_landfill", "category": "landfill"},
        {"id": 15, "name": "create_landfill", "category": "landfill"},
        {"id": 16, "name": "edit_landfill", "category": "landfill"},
        {"id": 17, "name": "delete_landfill", "category": "landfill"},

        {"id": 18, "name": "list_vehicle", "category": "vehicle"},
        {"id": 19, "name": "list_available_vehicle", "category": "vehicle"},
        {"id": 20, "name": "create_vehicle", "category": "vehicle"},
        {"id": 21, "name": "edit_vehicle", "category": "vehicle"},
        {"id": 22, "name": "delete_vehicle", "category": "vehicle"},


        {"id": 23, "name": "view_transfer", "category": "transfer"},
        {"id": 24, "name": "update_transfer_sts", "category": "transfer"},
        {"id": 25, "name": "update_transfer_landfill", "category": "transfer"},

        {"id": 26, "name": "report_available_vehicles", "category": "report"},
        {"id": 27, "name": "report_vehicles_in_transfer", "category": "report"},
        {"id": 28, "name": "report_total_sts", "category": "report"},
        {"id": 29, "name": "report_total_landfill", "category": "report"},
        {"id": 30, "name": "report_total_waste_transfer_by_landfill", "category": "report"},
        {"id": 31, "name": "report_total_waste_transfer_by_sts", "category": "report"},
        {"id": 32, "name": "report_total_oil_consumption_by_sts", "category": "report"},
        {"id": 33, "name": "report_total_transfer", "category": "report"},
        
        {"id": 34, "name": "get_fleet_planning", "category": "transfer"},

    ])

    roles_permissions_tbl = sa.Table('roles_permissions', meta, autoload_with=op.get_bind())
    op.bulk_insert(roles_permissions_tbl, [
        # System Admin
        # -------------------------------------

        # System Admin - User
        {"role_id": 1, "permission_id": 0},
        {"role_id": 1, "permission_id": 1},
        {"role_id": 1, "permission_id": 2},

        # System Admin - Role
        {"role_id": 1, "permission_id": 3},
        {"role_id": 1, "permission_id": 4},
        {"role_id": 1, "permission_id": 5},
        {"role_id": 1, "permission_id": 6},
        {"role_id": 1, "permission_id": 7},
        {"role_id": 1, "permission_id": 8},

        # System Admin - STS
        {"role_id": 1, "permission_id": 9},
        {"role_id": 1, "permission_id": 10},
        {"role_id": 1, "permission_id": 11},
        {"role_id": 1, "permission_id": 12},

        # System Admin - Landfill
        {"role_id": 1, "permission_id": 13},
        {"role_id": 1, "permission_id": 14},
        {"role_id": 1, "permission_id": 15},
        {"role_id": 1, "permission_id": 16},
        {"role_id": 1, "permission_id": 17},

        # System Admin - Vehicle
        {"role_id": 1, "permission_id": 18},
        {"role_id": 1, "permission_id": 20},
        {"role_id": 1, "permission_id": 21},
        {"role_id": 1, "permission_id": 22},

        # System Admin - Transfer
        {"role_id": 1, "permission_id": 23},
        {"role_id": 1, "permission_id": 34},

        # System Admin - Report
        {"role_id": 1, "permission_id": 26},
        {"role_id": 1, "permission_id": 27},
        {"role_id": 1, "permission_id": 28},
        {"role_id": 1, "permission_id": 29},
        {"role_id": 1, "permission_id": 30},
        {"role_id": 1, "permission_id": 31},
        {"role_id": 1, "permission_id": 32},
        {"role_id": 1, "permission_id": 33},

        # -------------------------------------

        # STS Manager
        # -------------------------------------

        # STS Manager - Vehicle
        {"role_id": 2, "permission_id": 18},
        {"role_id": 2, "permission_id": 19},

        # STS Manager - Landfil
        {"role_id": 2, "permission_id": 14},

        # STS Manager - Transfer
        {"role_id": 2, "permission_id": 23},
        {"role_id": 2, "permission_id": 24},
        {"role_id": 2, "permission_id": 34},

        # STS Manager - Report
        {"role_id": 2, "permission_id": 26},
        {"role_id": 2, "permission_id": 27},
        {"role_id": 2, "permission_id": 29},
        {"role_id": 2, "permission_id": 31},
        {"role_id": 2, "permission_id": 32},
        {"role_id": 2, "permission_id": 33},

        # -------------------------------------

        # Landfill Manager 
        # -------------------------------------

        # Landfill Manager - Landfil
        {"role_id": 3, "permission_id": 13},
        {"role_id": 3, "permission_id": 16},

        # Landfill Manager - Transfer
        {"role_id": 3, "permission_id": 23},
        {"role_id": 3, "permission_id": 25},  

        # Landfill Manager - Report
        {"role_id": 3, "permission_id": 27},
        {"role_id": 3, "permission_id": 28},
        {"role_id": 3, "permission_id": 30},
        {"role_id": 2, "permission_id": 33},

        # -------------------------------------
    ])

    # Users
    users_tbl = sa.Table('users', meta, autoload_with=op.get_bind())
    op.bulk_insert(users_tbl, [
        {"id": 0, "name": "System Admin", "email": "admin@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 1},
        {"id": 1, "name": "STS Manager", "email": "sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        {"id": 2, "name": "Landfil Manager", "email": "landfill@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 3}
    ])

    # STS
    sts_tbl = sa.Table('sts', meta, autoload_with=op.get_bind())
    op.bulk_insert(sts_tbl, [
        {"id": 0, "name": "Farmgate", "ward_no": 1, "latitude": 23.7561, "longitude": 90.3872, "capacity": 100}
    ])

    # STS Manager
    sts_manager_tbl = sa.Table('sts_managers', meta, autoload_with=op.get_bind())
    op.bulk_insert(sts_manager_tbl, [
        {"id": 0, "sts_id": 0, "user_id": 1}
    ])

    # Landfill
    landfill_tbl = sa.Table('landfills', meta, autoload_with=op.get_bind())
    op.bulk_insert(landfill_tbl, [
        {"id": 0, "name": "Aminbazar", "latitude": 23.7861, "longitude": 90.3299, "capacity": 1000, "current_capacity": 100, "time_start": 0, "time_end": 23},
        {"id": 1, "name": "Matuail", "latitude": 23.7261, "longitude": 90.4309, "capacity": 1000, "current_capacity": 100, "time_start": 0, "time_end": 23},
        {"id": 2, "name": "Keraniganj", "latitude": 23.7031, "longitude": 90.4079, "capacity": 1000, "current_capacity": 100, "time_start": 8, "time_end": 18},
    ])

    # Landfill Manager
    landfill_manager_tbl = sa.Table('landfill_managers', meta, autoload_with=op.get_bind())
    op.bulk_insert(landfill_manager_tbl, [
        {"id": 0, "landfill_id": 0, "user_id": 2}
    ])

    # Vehicle
    vehicle_tbl = sa.Table('vehicles', meta, autoload_with=op.get_bind())
    op.bulk_insert(vehicle_tbl, [
        {"id": 0, "reg_no": "BA 1 PA 1234", "capacity": 3, "vtype": "Truck", "loaded_cost": 0.3, "empty_cost": 0.1, "available": 1, "sts_id": 0},
        {"id": 1, "reg_no": "BA 2 PA 1234", "capacity": 5, "vtype": "Truck", "loaded_cost": 0.2, "empty_cost": 0.1, "available": 1, "sts_id": 0},
    ])



def downgrade() -> None:
    op.execute("DELETE FROM sessions")
    op.execute("DELETE FROM transfers")
    op.execute("DELETE FROM vehicles")
    op.execute("DELETE FROM landfill_managers")
    op.execute("DELETE FROM landfills")
    op.execute("DELETE FROM sts_managers")
    op.execute("DELETE FROM sts")
    op.execute("DELETE FROM users")
    op.execute("DELETE FROM roles_permissions")
    op.execute("DELETE FROM permissions")
    op.execute("DELETE FROM roles")