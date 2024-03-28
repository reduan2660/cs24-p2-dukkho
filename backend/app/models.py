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

    role = relationship("Role", back_populates="users")
    sts_manager = relationship("STSmanager", back_populates="user")
    landfill_manager = relationship("LandfillManager", back_populates="user")


class STS(Base):
    __tablename__ = "sts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    ward_no = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    vehicle = relationship("Vehicle", back_populates="sts")
    sts_manager = relationship("STSmanager", back_populates="sts")

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

    landfill_manager = relationship("LandfillManager", back_populates="landfill")

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
    
    sts_id = Column(Integer, ForeignKey("sts.id"))
    sts = relationship("STS", back_populates="vehicle")


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(Integer, primary_key=True, index=True)

    sts_id = Column(Integer, ForeignKey("sts.id"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))

    sts_arrival_time = Column(Integer, nullable=False) # utc timestamp

    sts_departure_time = Column(Integer)  # utc timestamp
    sts_departure_weight = Column(Float) # in tons

    oil = Column(Float) # in liters
    
    landfill_id = Column(Integer, ForeignKey("landfills.id"))
    landfill_arrival_time = Column(Integer) # utc timestamp
    landfill_arrival_weight = Column(Float)

    landfill_departure_time = Column(Integer) # utc timestamp

    # status with options:
    # 1. arrived at sts
    # 2. departed from sts
    # 3. arrived at landfill
    # 4. departed from landfill
    status = Column(Integer, nullable=False)

# arrival vehicle options = all vehicles of sts - status with 1, 2, 3
# landfill options = all landfills with current_capacity >= weight of waste