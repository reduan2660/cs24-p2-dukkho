from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Role, Permission, RolePermission
from app.config import SessionLocal

router = APIRouter(
    prefix="/rbac",
    tags=["roles"],
    responses={404: {"description": "Route not found"}},
)


@router.get("/")
async def get_roles(user: User = Depends(get_user_from_session)):
    if "list_all_roles" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        roles = db.query(Role).all()
        response = []
        for role in roles:
            role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
            permissions = []
            for rp in role_permissions:
                permission = db.query(Permission).filter(Permission.id == rp.permission_id).first()
                permissions.append(permission.name)

            response.append({
                "id": role.id,
                "name": role.name,
                "permissions": permissions
            })

        return JSONResponse(status_code=200, content=response)

class RoleRequest(BaseModel):
    name: str

@router.post("/")
async def create_role(role: RoleRequest, user: User = Depends(get_user_from_session)):

    if "create_role" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        latest_id = db.query(Role).order_by(Role.id.desc()).first()

        db.add(Role(
            id=latest_id.id + 1,
            name=role.name
        ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Role created successfully"})


@router.put("/{role_id}")
async def update_role(role_id: int, role: RoleRequest, user: User = Depends(get_user_from_session)):

    if "create_role" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.query(Role).filter(Role.id == role_id).update({"name": role.name})
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Role updated successfully"})
    

@router.delete("/{role_id}")
async def delete_role(role_id: int, user: User = Depends(get_user_from_session)):

    if "create_role" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.query(Role).filter(Role.id == role_id).delete()
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Role deleted successfully"})
     

# List all permissions
@router.get("/permissions")
async def list_permissions(user: User = Depends(get_user_from_session)):

    if "list_all_permissions" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        permissions = db.query(Permission).all()
        response = []
        for permission in permissions:
            response.append({
                "id": permission.id,
                "name": permission.name,
                "category": permission.category
            })

        categories = set([p.category for p in permissions])
        category_response = []
        for category in categories:
            category_permission = []
            for p in permissions:
                if p.category == category:
                    category_permission.append({
                        "id": p.id,
                        "name": p.name
                    })

            category_response.append({
                "category": category,
                "permissions": category_permission
            })

        return JSONResponse(status_code=200, content=category_response)


# Edit role permissions
class RolePermissionRequest(BaseModel):
    permissions: List[int]

@router.put("/{role_id}/permissions")
async def edit_role_permissions(role_id: int, role_permissions: RolePermissionRequest, user: User = Depends(get_user_from_session)):

    if "edit_role_permission" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()

        latest_id = db.query(RolePermission).order_by(RolePermission.id.desc()).first().id
        for permission_id in role_permissions.permissions:
            latest_id += 1
            db.add(RolePermission(
                id=latest_id,
                role_id=role_id,
                permission_id=permission_id
            ))

        db.commit()
        return JSONResponse(status_code=200, content={"message": "Role permissions updated successfully"})
    