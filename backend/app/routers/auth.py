from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.dependencies import get_user_from_session
import os
from uuid import uuid4
from datetime import datetime
from app.models import User, Session, Role, Permission, RolePermission
from app.config import SessionLocal


from passlib.context import CryptContext
SECRET_KEY     = os.getenv("SECRET_KEY")
HASH_ALGORITHM = "HS256"
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Route not found"}},
)


class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    with SessionLocal() as db:
        # Check user credentials
        user = db.query(User).filter(User.email == request.email).first()
        if user is None:
            return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
        
        if not pwd_context.verify(request.password, user.password):
            return JSONResponse(status_code=401, content={"message": "Invalid credentials"})

        # Check if already logged in
        session = db.query(Session).filter(Session.user_id == user.id).first()
        if session is not None:
            session_token = session.id
        
        else:
            # Create session token
            expires = datetime.now().timestamp() + 60 * 60 * 24 * 30 # 30 days
            session_token = str(uuid4())
            session = Session(
                id=session_token,
                user_id=user.id,
                expires=expires
            )
            db.add(session)
            db.commit()

        role = db.query(Role).filter(Role.id == user.role_id).first()
        role_permissions = db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
        permissions = []
        for rp in role_permissions:
            permission = db.query(Permission).filter(Permission.id == rp.permission_id).first()
            permissions.append(permission.name)

        # Craft response    
        response = JSONResponse(
            status_code=200, 
            content={
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": {
                        "id": role.id,
                        "name": role.name,
                        "permissions": permissions
                    }
            })
        
        response.set_cookie('SESSION', session_token)
        return response

@router.get("/me")
async def get_profile(user: User = Depends(get_user_from_session)):
    return user


@router.get("/logout")
async def logout(user: User = Depends(get_user_from_session)):

    with SessionLocal() as db:
        session = db.query(Session).filter(Session.user_id == user['id']).first()
        db.delete(session)
        db.commit()

    
    response = JSONResponse(
        status_code=200, 
        content={"message": "Logged out"}
    )
    response.delete_cookie('SESSION')

    return response


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, user: User = Depends(get_user_from_session)):
    with SessionLocal() as db:
        user = db.query(User).filter(User.id == user['id']).first()
        if not pwd_context.verify(request.old_password, user.password):
            return JSONResponse(status_code=401, content={"message": "Invalid credentials"})
        
        user.password = pwd_context.hash(request.new_password)
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Password changed"})
    
class ResetPasswordRequest(BaseModel):
    email: str
@router.post("/reset-password/initiate")
async def reset_password(request: ResetPasswordRequest):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == request.email).first()
        if user is None:
            return JSONResponse(status_code=401, content={"message": "User not found"})
        
        # STATIC TOKEN
        token = "1234"
        # TODO: SEND EMAIL

        return JSONResponse(status_code=200, content={"message": "Token sent to email."})
    

class ResetPasswordConfirmRequest(BaseModel):
    email: str
    token: str
    new_password: str
@router.post("/reset-password/confirm")
async def reset_password_confirm(request: ResetPasswordConfirmRequest):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == request.email).first()
        if user is None:
            return JSONResponse(status_code=404, content={"message": "User not found"})
        
        # STATIC TOKEN
        if request.token == "1234":

            user.password = pwd_context.hash(request.new_password)
            db.commit()
            return JSONResponse(status_code=200, content={"message": "Password reset"})
        
        return JSONResponse(status_code=401, content={"message": "Invalid token"})
