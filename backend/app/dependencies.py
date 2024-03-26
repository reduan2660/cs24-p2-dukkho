from fastapi import HTTPException, Cookie
from typing_extensions import Annotated
from datetime import datetime

from app.config import SessionLocal
from app.models import User, Session, Role, Permission, RolePermission

async def get_user_from_session(SESSION: Annotated[str, Cookie()] = None):

    if SESSION is None:
        raise HTTPException(status_code=401, detail="Invalid session token")
    
    with SessionLocal() as db:
        session = db.query(Session).filter(Session.id == SESSION).first()
        if session is None:
            raise HTTPException(status_code=401, detail="Invalid session token")
        else:

            # check expiration
            if session.expires < datetime.now().timestamp():
                raise HTTPException(status_code=401, detail="Session token expired")
            else:
                user = db.query(User).filter(User.id == session.user_id).first()
                role = db.query(Role).filter(Role.id == user.role_id).first()
                role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
                permissions = []
                for rp in role_permissions:
                    permission = db.query(Permission).filter(Permission.id == rp.permission_id).first()
                    permissions.append(permission.name)

                return {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": {
                        "id": role.id,
                        "name": role.name,
                        "permissions": permissions
                    } 
                }