from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.dependencies import get_user_from_session
from app.models import User, Role, Permission, RolePermission
from app.config import SessionLocal
import os

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
async def get_users(user: User = Depends(get_user_from_session)):

    if "list_all_users" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        users = db.query(User).all()
        response = []
        for user in users:
            role = db.query(Role).filter(Role.id == user.role_id).first()
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
                }
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
            }
        }

        return JSONResponse(status_code=200, content=response)
    

class NewUserRequest(BaseModel):
    name: str
    email: str
    password: str

@router.post("/")
async def create_user(userRequest: NewUserRequest, user: User = Depends(get_user_from_session)):

    if "create_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        newUser = User(
            name=userRequest.name,
            email=userRequest.email,
            password=pwd_context.hash(userRequest.password),
            role_id=0 # default role, unassigned
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