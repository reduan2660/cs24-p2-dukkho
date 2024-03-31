from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, STS, STSmanager, Vehicle
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
                "longitude": st.longitude,
                "capacity": st.capacity,
                "managers": [
                    {
                        "id": m.user_id,
                        "name": m.user.name,
                        "email": m.user.email
                    } for m in db.query(STSmanager).filter(STSmanager.sts_id == st.id).all()
                ],
                "vehicles": [
                    {
                        "id": v.id,
                        "reg_no": v.reg_no,
                        "capacity": v.capacity,
                        "vtype": v.vtype,
                        "loaded_cost": v.loaded_cost,
                        "empty_cost": v.empty_cost
                    } for v in db.query(Vehicle).filter(Vehicle.sts_id == st.id).all()
                ]
            })

        return JSONResponse(status_code=200, content=response)
    

class STSrequest(BaseModel):
    name: str
    ward_no: int
    latitude: float
    longitude: float
    capacity: float

@router.post("/")
async def create_sts(sts: STSrequest, user: User = Depends(get_user_from_session)):

    if "create_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        latest_id = db.query(STS).order_by(STS.id.desc()).first()
        if latest_id is None:
            sts_id = 1
        db.add(STS(
            id=latest_id.id + 1,
            name=sts.name,
            ward_no=sts.ward_no,
            latitude=sts.latitude,
            longitude=sts.longitude,
            capacity=sts.capacity
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
    capacity: float

@router.put("/{sts_id}")
async def update_sts(sts_id: int, sts: STSUpdateRequest, user: User = Depends(get_user_from_session)):
        
        if "edit_sts" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        with SessionLocal() as db:
            db.query(STS).filter(STS.id == sts_id).update({
                "name": sts.name,
                "ward_no": sts.ward_no,
                "latitude": sts.latitude,
                "longitude": sts.longitude,
                "capacity": sts.capacity
            })
            db.commit()
            return JSONResponse(status_code=200, content={"message": "STS updated successfully"})
    

class STSManagerRequest(BaseModel):
    sts_id: int
    user_id: List[int]

@router.post("/manager")
async def assign_manager(stsManager: STSManagerRequest, user: User = Depends(get_user_from_session)):
    """
    Assign only for STS managers and Unassigned users.
    Will reassign the managers of existing STS manager.
    """
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
                return JSONResponse(status_code=400, content={"message": "User is not a STS manager or Unassigned"})

            if user.role_id == 2:
                # check if user is already a STS manager of another STS
                # if yes, then remove that sts manager and assign to this sts
                sts = db.query(STSmanager).filter(STSmanager.user_id == user_id).first()
                if sts is not None:
                    db.query(STSmanager).filter(STSmanager.user_id == user_id).delete()
                    
            if user.role_id == 0:
                # update the role to STS manager
                db.query(User).filter(User.id == user_id).update({"role_id": 2})


            db.add(STSmanager(
                sts_id=stsManager.sts_id,
                user_id=user_id
            ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "STS manager assigned successfully"})
    

@router.get("/my")
async def get_my_sts(user: User = Depends(get_user_from_session)):
    """
    Get the STS assigned to the user
    """
    if user["role"]["id"] != 2:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).all()
        response = []
        for st in sts:
            st = db.query(STS).filter(STS.id == st.sts_id).first()
            response.append({
                "id": st.id,
                "name": st.name,
                "ward_no": st.ward_no,
                "latitude": st.latitude,
                "longitude": st.longitude,
                "capacity": st.capacity
            })

        return JSONResponse(status_code=200, content=response)