from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.config import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires = Column(Float, nullable=False)

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    users = relationship("User", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)

    roles = relationship("RolePermission", back_populates="permission")


class RolePermission(Base):
    __tablename__ = "roles_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"))
    permission_id = Column(Integer, ForeignKey("permissions.id"))

    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))

    username = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    created_at = Column(Integer, nullable=True) # utc timestamp

    role = relationship("Role", back_populates="users")
    sts_manager = relationship("STSmanager", back_populates="user")
    landfill_manager = relationship("LandfillManager", back_populates="user")
    contract_manager = relationship("ContractManager", back_populates="user")
    employee = relationship("Employee", back_populates="user")
    
    ticket = relationship("Ticket", back_populates="user")
    post = relationship("Post", back_populates="user")
    like = relationship("PostLike", back_populates="user")


class STS(Base):
    __tablename__ = "sts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    ward_no = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False) # in ton
    current_load = Column(Float, nullable=False, default=0) # in ton

    time_start = Column(Integer, nullable=False) # 24 hour format
    time_end = Column(Integer, nullable=False) # 24 hour format
    fine = Column(Float, nullable=False)
    
    
    vehicle = relationship("Vehicle", back_populates="sts")
    sts_manager = relationship("STSmanager", back_populates="sts")
    transfer = relationship("Transfer", back_populates="sts")
    contract = relationship("Contract", back_populates="sts")
    garbage_collection = relationship("GarbageCollection", back_populates="sts")

class STSmanager(Base):
    __tablename__ = "sts_managers"

    id = Column(Integer, primary_key=True, index=True)
    sts_id = Column(Integer, ForeignKey("sts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    sts = relationship("STS", back_populates="sts_manager")
    user = relationship("User", back_populates="sts_manager")

class Landfill(Base):
    __tablename__ = "landfills"

    id = Column(Integer, primary_key=True, index=True)
    name= Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False)
    current_capacity = Column(Float, nullable=False)
    time_start = Column(Integer, nullable=False) # 24 hour format
    time_end = Column(Integer, nullable=False) # 24 hour format

    landfill_manager = relationship("LandfillManager", back_populates="landfill")
    transfer = relationship("Transfer", back_populates="landfill")

class LandfillManager(Base):
    __tablename__ = "landfill_managers"

    id = Column(Integer, primary_key=True, index=True)
    landfill_id = Column(Integer, ForeignKey("landfills.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    landfill = relationship("Landfill", back_populates="landfill_manager")
    user = relationship("User", back_populates="landfill_manager")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String, unique=True, index=True, nullable=False)
    capacity = Column(Integer, nullable=False)
    vtype = Column(String, nullable=False)
    loaded_cost = Column(Float, nullable=False)
    empty_cost = Column(Float, nullable=False)
    available = Column(Integer, nullable=False)
    
    sts_id = Column(Integer, ForeignKey("sts.id"))
    sts = relationship("STS", back_populates="vehicle")
    transfer = relationship("Transfer", back_populates="vehicle")



class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)

    sts_id = Column(Integer, ForeignKey("sts.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    landfill_id = Column(Integer, ForeignKey("landfills.id"))

    sts_departure_time = Column(Integer, nullable=False)  # utc timestamp
    sts_departure_weight = Column(Float, nullable=False) # in tons

    oil = Column(Float, nullable=False) # in liters
    
    
    landfill_arrival_time = Column(Integer) # utc timestamp
    landfill_arrival_weight = Column(Float)

    landfill_departure_time = Column(Integer) # utc timestamp

    sts_arrival_time = Column(Integer) # utc timestamp

    # status with options:
    # 1. Departed from sts
    # 2. Arrived at landfill
    # 3. Departed from landfill
    # 4. Trip completed
    status = Column(Integer, nullable=False)

    sts = relationship("STS", back_populates="transfer")
    vehicle = relationship("Vehicle", back_populates="transfer")
    landfill = relationship("Landfill", back_populates="transfer")


# arrival vehicle options = all vehicles of sts - status with 1, 2, 3
# landfill options = all landfills with current_capacity >= weight of waste


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    reg_id = Column(String, unique=True, index=True, nullable=False)
    reg_date = Column(Integer, nullable=False) # utc timestamp
    tin = Column(String, unique=True, index=True, nullable=False)
    contact = Column(String, nullable=False)
    workforce_size = Column(Integer, nullable=False, default=0) # updated when employee is created
    pay_per_ton = Column(Float, nullable=False)
    required_waste_ton = Column(Float, nullable=False)
    contract_duration = Column(Integer, nullable=False) # in months
    area_of_collection = Column(String, nullable=False)
    sts_id = Column(Integer, ForeignKey("sts.id"))

    sts = relationship("STS", back_populates="contract")
    contract_manager = relationship("ContractManager", back_populates="contract")
    collection_plan = relationship("CollectionPlan", back_populates="contract")
    garbage_collection = relationship("GarbageCollection", back_populates="contract")


class ContractManager(Base):
    __tablename__ = "contract_managers"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    contract = relationship("Contract", back_populates="contract_manager")
    user = relationship("User", back_populates="contract_manager")


class CollectionPlan(Base):
    __tablename__ = "collection_plans"

    id = Column(Integer, primary_key=True, index=True)
    area_of_collection = Column(String, nullable=False)
    ward = Column(String, nullable=True)
    start_time_hr = Column(Integer, nullable=False)
    start_time_min = Column(Integer, nullable=False)
    duration = Column(Integer, nullable=False) # in minutes
    no_of_labour = Column(Integer, nullable=False, default=0) # updated when employee is created
    no_of_vehicle = Column(Integer, nullable=False)
    daily_waste_ton = Column(Float, nullable=False)

    contract_id = Column(Integer, ForeignKey("contracts.id"))

    contract = relationship("Contract", back_populates="collection_plan")
    employee = relationship("EmployeeActivity", back_populates="plan")
    garbage_collection = relationship("GarbageCollection", back_populates="collection_plan")


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date_of_birth = Column(Integer, nullable=False) # utc timestamp
    date_of_hire = Column(Integer, nullable=False) # utc timestamp
    job_title = Column(String, nullable=False)
    pay_per_hour = Column(Float, nullable=False)
    plan_id = Column(Integer, ForeignKey("collection_plans.id"))

    user = relationship("User", back_populates="employee")
    activity = relationship("EmployeeActivity", back_populates="employee")
    garbage_collection = relationship("GarbageCollection", back_populates="employee")


class EmployeeActivity(Base):
    __tablename__ = "employee_activities"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Integer, nullable=False) # utc timestamp
    plan_id = Column(Integer, ForeignKey("collection_plans.id"))
    login = Column(Integer, nullable=True) # utc timestamp
    logout = Column(Integer, nullable=True) # utc timestamp
    work_duration = Column(Integer, nullable=True) # in minutes
    is_absent = Column(Integer, nullable=False, default=0) # 0 for present, 1 for absent
    is_on_leave = Column(Integer, nullable=False, default=0) # 0 for not on leave, 1 for on leave


    employee = relationship("Employee", back_populates="activity")
    plan = relationship("CollectionPlan", back_populates="employee")



class GarbageCollection(Base):
    __tablename__ = "garbage_collection"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    collection_plan_id = Column(Integer, ForeignKey("collection_plans.id"))
    contract_id = Column(Integer, ForeignKey("contracts.id"))
    sts_id = Column(Integer, ForeignKey("sts.id"))
    collection_start_time = Column(Integer, nullable=False) # utc timestamp
    collection_end_time = Column(Integer, nullable=True) # utc timestamp
    collected_weight = Column(Float, nullable=True)
    vehicle = Column(String, nullable=True)
    status = Column(Integer, nullable=False) # 0 for started, 1 for arrived at sts, 2 for completed

    sts = relationship("STS", back_populates="garbage_collection")
    collection_plan = relationship("CollectionPlan", back_populates="garbage_collection")
    employee = relationship("Employee", back_populates="garbage_collection")
    contract = relationship("Contract", back_populates="garbage_collection")



# app

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    location = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    anonymous = Column(Integer, nullable=False, default=0) # 0 for not anonymous, 1 for anonymous
    reply = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(Integer, nullable=False) # utc timestamp

    user = relationship("User", back_populates="ticket")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    like_count = Column(Integer, nullable=False, default=0)
    approval = Column(Integer, nullable=False, default=0) # 0 for not approved, 1 for approved
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(Integer, nullable=False) # utc timestamp

    user = relationship("User", back_populates="post")
    like = relationship("PostLike", back_populates="post")


class PostLike(Base):
    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    post = relationship("Post", back_populates="like")
    user = relationship("User", back_populates="like")