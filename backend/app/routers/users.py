from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel
from app.dependencies import get_user_from_session
from app.models import User, Role, Permission, RolePermission, STSmanager, LandfillManager
from app.config import SessionLocal
import os
from datetime import datetime

from passlib.context import CryptContext
SECRET_KEY     = os.getenv("SECRET_KEY")
HASH_ALGORITHM = "HS256"
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_users(roles: List[int] = Query([]),  user: User = Depends(get_user_from_session)):

    if "list_all_users" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        users = db.query(User).all()
        response = []
        for user in users:
            role = db.query(Role).filter(Role.id == user.role_id).first()

            if role.id not in roles and len(roles) > 0:
                continue

            role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
            permissions = []
            for rp in role_permissions:
                permission = db.query(Permission).filter(Permission.id == rp.permission_id).first()
                permissions.append(permission.name)

            response.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": {
                    "id": role.id,
                    "name": role.name,
                    "permissions": permissions
                },
                "username": user.username,
                "contact": user.contact,
                "created_at": user.created_at
            })

        return JSONResponse(status_code=200, content=response)
    

@router.get("/{user_id}")
async def get_user(user_id: int, user: User = Depends(get_user_from_session)):

    if "list_all_users" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        role = db.query(Role).filter(Role.id == user.role_id).first()
        role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
        permissions = []
        for rp in role_permissions:
            permission = db.query(Permission).filter(Permission.id == rp.permission_id).first()
            permissions.append(permission.name)

        response = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": {
                "id": role.id,
                "name": role.name,
                "permissions": permissions
            },
            "username": user.username,
            "contact": user.contact,
            "created_at": user.created_at
        }

        return JSONResponse(status_code=200, content=response)
    

class NewUserRequest(BaseModel):
    name: str
    email: str
    password: str
    contact: str = None
    username: str = None

@router.post("/")
async def create_user(userRequest: NewUserRequest, user: User = Depends(get_user_from_session)):

    if "create_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        latest_user_id = db.query(User).order_by(User.id.desc()).first().id
        
        # check if email already exists
        user = db.query(User).filter(User.email == userRequest.email).first()
        if user is not None:
            return JSONResponse(status_code=400, content={"message": "Email already exists"})

        newUser = User(
            id=latest_user_id + 1,
            name=userRequest.name,
            email=userRequest.email,
            password=pwd_context.hash(userRequest.password),
            role_id=0, # default role, unassigned

            username=userRequest.username,
            contact=userRequest.contact,
            created_at=  int(datetime.utcnow().timestamp())
        )
        db.add(newUser)
        db.commit()
        return JSONResponse(status_code=201, content={"message": "User created"})
    


@router.delete("/{user_id}")
async def delete_user(user_id: int, user: User = Depends(get_user_from_session)):

    if "delete_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        db.delete(user)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "User deleted"})
    
class UpdateUserRequest(BaseModel):
    name: str
    # email: str

@router.put("/{user_id}")
async def update_user(user_id: int, userRequest: UpdateUserRequest, user: User = Depends(get_user_from_session)):

    if "delete_user" not in user["role"]["permissions"] and user["id"] != user_id:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        user.name = userRequest.name
        # user.email = userRequest.email
        db.commit()
        return JSONResponse(status_code=200, content={"message": "User updated"})
    
# Assign roles to user
class AssignRoleRequest(BaseModel):
    role_id: int

@router.patch("/{user_id}")
async def assign_role(user_id: int, assignRoleRequest: AssignRoleRequest, user: User = Depends(get_user_from_session)):
    if "assign_role_to_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        role = db.query(Role).filter(Role.id == assignRoleRequest.role_id).first()
        if role is None:
            return JSONResponse(status_code=404, content={"message": "Role not found"})
        
        user.role_id = role.id


        # remove the user from all sts and landfill
        db.query(STSmanager).filter(STSmanager.user_id == user_id).delete()
        db.query(LandfillManager).filter(LandfillManager.user_id == user_id).delete()
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Role assigned to user"})
    
class NewUserRequest(BaseModel):
    name: str
    email: str
    password: str
    contact: str = None
    username: str = None

@router.post("/register")
async def register_user(userRequest: NewUserRequest):

    with SessionLocal() as db:

        latest_user_id = db.query(User).order_by(User.id.desc()).first().id
        
        # check if email already exists
        user = db.query(User).filter(User.email == userRequest.email).first()
        if user is not None:
            return JSONResponse(status_code=400, content={"message": "Email already exists"})

        newUser = User(
            id=latest_user_id + 1,
            name=userRequest.name,
            email=userRequest.email,
            password=pwd_context.hash(userRequest.password),
            role_id=6, # user

            username=userRequest.username,
            contact=userRequest.contact,
            created_at=  int(datetime.utcnow().timestamp())
        )
        db.add(newUser)
        db.commit()
        return JSONResponse(status_code=201, content={"message": "User created"})