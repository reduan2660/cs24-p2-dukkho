from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, STS, STSmanager
from app.config import SessionLocal

router = APIRouter(
    prefix="/sts",
    tags=["sts"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_sts(user: User = Depends(get_user_from_session)):

    if "list_all_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        sts = db.query(STS).all()
        response = []
        for st in sts:
            response.append({
                "id": st.id,
                "name": st.name,
                "ward_no": st.ward_no,
                "latitude": st.latitude,
                "longitude": st.longitude
            })

        return JSONResponse(status_code=200, content=response)
    

class STSrequest(BaseModel):
    name: str
    ward_no: int
    latitude: float
    longitude: float

@router.post("/")
async def create_sts(sts: STSrequest, user: User = Depends(get_user_from_session)):

    if "create_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.add(STS(
            name=sts.name,
            ward_no=sts.ward_no,
            latitude=sts.latitude,
            longitude=sts.longitude
        ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "STS created successfully"})
    

@router.delete("/{sts_id}")
async def delete_sts(sts_id: int, user: User = Depends(get_user_from_session)):

    if "delete_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.query(STS).filter(STS.id == sts_id).delete()
        db.commit()
        return JSONResponse(status_code=200, content={"message": "STS deleted successfully"})
    

class STSUpdateRequest(BaseModel):
    name: str
    ward_no: int
    latitude: float
    longitude: float

@router.put("/{sts_id}")
async def update_sts(sts_id: int, sts: STSUpdateRequest, user: User = Depends(get_user_from_session)):
        
        if "edit_sts" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        with SessionLocal() as db:
            db.query(STS).filter(STS.id == sts_id).update({
                "name": sts.name,
                "ward_no": sts.ward_no,
                "latitude": sts.latitude,
                "longitude": sts.longitude
            })
            db.commit()
            return JSONResponse(status_code=200, content={"message": "STS updated successfully"})
    

class STSManagerRequest(BaseModel):
    sts_id: int
    user_id: List[int]

@router.post("/manager")
async def assign_manager(stsManager: STSManagerRequest, user: User = Depends(get_user_from_session)):

    if "assign_role_to_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        # delete all previous managers but dont commit
        db.query(STSmanager).filter(STSmanager.sts_id == stsManager.sts_id).delete()
        for user_id in stsManager.user_id:

            # check if user_id is either a STS manager or a Unassigned
            user = db.query(User).filter(User.id == user_id).first()
            if user is None:
                return JSONResponse(status_code=404, content={"message": "User not found"})

            if user.role_id != 2 and user.role_id != 0:
                return JSONResponse(status_code=400, content={"message": "User is not a STS manager"})

            db.add(STSmanager(
                sts_id=stsManager.sts_id,
                user_id=user_id
            ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "STS manager assigned successfully"})