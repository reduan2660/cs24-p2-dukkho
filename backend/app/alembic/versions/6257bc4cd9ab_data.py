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
        {"id": 4, "name": "Contract Manager"}
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

        {"id": 35, "name": "list_contract", "category": "contract"},
        {"id": 36, "name": "create_contract", "category": "contract"},
        {"id": 37, "name": "edit_contract", "category": "contract"},
        {"id": 38, "name": "delete_contract", "category": "contract"},

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

        # Syetem Admin - Contract
        {"role_id": 1, "permission_id": 35},
        {"role_id": 1, "permission_id": 36},
        {"role_id": 1, "permission_id": 37},
        {"role_id": 1, "permission_id": 38},
        

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
        {"role_id": 3, "permission_id": 28},
        {"role_id": 3, "permission_id": 30},
        {"role_id": 2, "permission_id": 33},

        # -------------------------------------
    ])

    # Users
    users_tbl = sa.Table('users', meta, autoload_with=op.get_bind())
    op.bulk_insert(users_tbl, [
        {"id": 0, "name": "System Admin", "email": "admin@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 1},


        {"id": 1, "name": "Srizon", "email": "farmgate.sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        {"id": 2, "name": "Jim", "email": "jatrabari.sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        {"id": 3, "name": "Banik", "email": "mohakhali.sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        {"id": 4, "name": "Shoeb", "email": "uttara.sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        {"id": 5, "name": "Jawad", "email": "gulshan.sts@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 2},
        
        
        {"id": 6, "name": "Yeamin", "email": "aminbazar.landfill@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 3},
        {"id": 7, "name": "Alve", "email": "matuail.landfill@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 3},
        {"id": 8, "name": "Kaiser", "email": "keraniganj.landfill@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 3},
        {"id": 9, "name": "Reduan", "email": "alinogor.landfill@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 3},
        
        {"id": 10, "name": "Shuvo", "email": "unassigned@ecosync.com", "password": HASHED_SUPERADMIN_PASSWORD, "role_id": 0},
    ])

    # STS
    sts_tbl = sa.Table('sts', meta, autoload_with=op.get_bind())
    op.bulk_insert(sts_tbl, [
        {"id": 0, "name": "Farmgate", "ward_no": 1, "latitude": 23.7561, "longitude": 90.3872, "capacity": 200},
        {"id": 1, "name": "Jatrabari", "ward_no": 2, "latitude": 23.7106, "longitude": 90.4349, "capacity": 300},
        {"id": 2, "name": "Mohakhali", "ward_no": 3, "latitude": 23.7778, "longitude": 90.4057, "capacity": 250},
        {"id": 3, "name": "Uttara", "ward_no": 4, "latitude": 23.8759, "longitude": 90.3795, "capacity": 500},
        {"id": 4, "name": "Gulshan", "ward_no": 5, "latitude": 23.7925, "longitude": 90.4078, "capacity": 600}
    ])

    # STS Manager
    sts_manager_tbl = sa.Table('sts_managers', meta, autoload_with=op.get_bind())
    op.bulk_insert(sts_manager_tbl, [
        {"id": 0, "sts_id": 0, "user_id": 1},
        {"id": 1, "sts_id": 1, "user_id": 2},
        {"id": 2, "sts_id": 2, "user_id": 3},
        {"id": 3, "sts_id": 3, "user_id": 4},
        {"id": 4, "sts_id": 4, "user_id": 5},
    ])

    # Landfill
    landfill_tbl = sa.Table('landfills', meta, autoload_with=op.get_bind())
    op.bulk_insert(landfill_tbl, [
        {"id": 0, "name": "Aminbazar", "latitude": 23.7861, "longitude": 90.3299, "capacity": 3000, "current_capacity": 3000, "time_start": 9, "time_end": 22},
        {"id": 1, "name": "Matuail", "latitude": 23.7061, "longitude": 90.4620, "capacity": 5000, "current_capacity": 5000, "time_start": 10, "time_end": 23},
        {"id": 2, "name": "Keraniganj", "latitude": 23.6933, "longitude": 90.3818, "capacity": 6000, "current_capacity": 6000, "time_start": 8, "time_end": 17},
        {"id": 3, "name": "Alinogor", "latitude": 23.1142, "longitude": 90.2573, "capacity": 4000, "current_capacity": 4000, "time_start": 8, "time_end": 20}
    ])

    # Landfill Manager
    landfill_manager_tbl = sa.Table('landfill_managers', meta, autoload_with=op.get_bind())
    op.bulk_insert(landfill_manager_tbl, [
        {"id": 0, "landfill_id": 0, "user_id": 6},
        {"id": 1, "landfill_id": 1, "user_id": 7},
        {"id": 2, "landfill_id": 2, "user_id": 8},
        {"id": 3, "landfill_id": 3, "user_id": 9}
    ])

    # Vehicle
    vehicle_tbl = sa.Table('vehicles', meta, autoload_with=op.get_bind())
    op.bulk_insert(vehicle_tbl, [
        {"id": 0, "reg_no": "BA 1 PA 1234", "capacity": 3, "vtype": "Open Truck", "loaded_cost": 1.0, "empty_cost": 0.5, "available": 1, "sts_id": 0},
        {"id": 1, "reg_no": "BA 4 PA 7890", "capacity": 3, "vtype": "Open Truck", "loaded_cost": 0.9, "empty_cost": 0.4, "available": 1, "sts_id": 1},
        {"id": 2, "reg_no": "BA 2 PA 3456", "capacity": 3, "vtype": "Open Truck", "loaded_cost": 1.1, "empty_cost": 0.6, "available": 1, "sts_id": 2},
        {"id": 3, "reg_no": "BA 3 PA 5678", "capacity": 3, "vtype": "Open Truck", "loaded_cost": 1.0, "empty_cost": 0.5, "available": 1, "sts_id": 3},

        {"id": 4, "reg_no": "BA 1 PA 1235", "capacity": 5, "vtype": "Dump Truck", "loaded_cost": 1.5, "empty_cost": 0.2, "available": 1, "sts_id": 0},
        {"id": 5, "reg_no": "BA 2 PA 3457", "capacity": 5, "vtype": "Dump Truck", "loaded_cost": 1.5, "empty_cost": 0.3, "available": 1, "sts_id": 0},
        {"id": 6, "reg_no": "BA 3 PA 5679", "capacity": 5, "vtype": "Dump Truck", "loaded_cost": 1.4, "empty_cost": 0.2, "available": 1, "sts_id": 2},
        {"id": 7, "reg_no": "BA 4 PA 7891", "capacity": 5, "vtype": "Dump Truck", "loaded_cost": 1.3, "empty_cost": 0.1, "available": 1, "sts_id": 4},

        {"id": 8, "reg_no": "BA 1 PA 1236", "capacity": 7, "vtype": "Compactor", "loaded_cost": 1.8, "empty_cost": 0.4, "available": 1, "sts_id": 1},
        {"id": 9, "reg_no": "BA 2 PA 3458", "capacity": 7, "vtype": "Compactor", "loaded_cost": 1.7, "empty_cost": 0.3, "available": 1, "sts_id": 0},
        {"id": 10, "reg_no": "BA 3 PA 5680", "capacity": 7, "vtype": "Compactor", "loaded_cost": 1.9, "empty_cost": 0.4, "available": 1, "sts_id": 3},
        {"id": 11, "reg_no": "BA 5 PA 7892", "capacity": 7, "vtype": "Compactor", "loaded_cost": 1.8, "empty_cost": 0.3, "available": 1, "sts_id": 4},

        {"id": 12, "reg_no": "BA 1 PA 1237", "capacity": 15, "vtype": "Container Carrier", "loaded_cost": 5.1, "empty_cost": 0.7, "available": 1, "sts_id": 2},
        {"id": 13, "reg_no": "BA 2 PA 3459", "capacity": 15, "vtype": "Container Carrier", "loaded_cost": 5.2, "empty_cost": 0.8, "available": 1, "sts_id": 3},
        {"id": 14, "reg_no": "BA 3 PA 5681", "capacity": 15, "vtype": "Container Carrier", "loaded_cost": 5.3, "empty_cost": 0.9, "available": 1, "sts_id": 4},
        {"id": 15, "reg_no": "BA 4 PA 7893", "capacity": 15, "vtype": "Container Carrier", "loaded_cost": 5.4, "empty_cost": 0.8, "available": 1, "sts_id": 4},
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