from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Landfill, LandfillManager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/landfill",
    tags=["landfill"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_landfill(user: User = Depends(get_user_from_session)):

    if "list_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        if user["role"]["id"] == 3: # Landfill Manager
            landfill = db.query(Landfill).join(LandfillManager).filter(LandfillManager.user_id == user["id"]).all()
        else:
            landfill = db.query(Landfill).all()
        response = []
        for lf in landfill:
            response.append({
                "id": lf.id,
                "name": lf.name,
                "latitude": lf.latitude,
                "longitude": lf.longitude,
                "capacity": lf.capacity,
                "current_capacity": lf.current_capacity,
                "time_start": lf.time_start,
                "time_end": lf.time_end,
                "managers": [
                    {
                        "id": m.user_id,
                        "name": m.user.name,
                        "email": m.user.email
                    } for m in db.query(LandfillManager).filter(LandfillManager.landfill_id == lf.id).all()
                ]
            })
    
        return JSONResponse(status_code=200, content=response)
    

class Landfillrequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: float
    time_start: int
    time_end: int

@router.post("/")
async def create_landfill(landfill: Landfillrequest, user: User = Depends(get_user_from_session)):

    if "create_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        latest_landfill_id = db.query(Landfill).order_by(Landfill.id.desc()).first()
        if latest_landfill_id is None:
            latest_landfill_id = 0

        db.add(Landfill(
            id=latest_landfill_id.id + 1,
            name=landfill.name,
            latitude=landfill.latitude,
            longitude=landfill.longitude,
            capacity=landfill.capacity,
            current_capacity=landfill.capacity,
            time_start=landfill.time_start,
            time_end=landfill.time_end
        ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Landfill created successfully"})
    

@router.delete("/{landfill_id}")
async def delete_landfill(landfill_id: int, user: User = Depends(get_user_from_session)):

    if "delete_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        landfill = db.query(Landfill).filter(Landfill.id == landfill_id).first()
        if not landfill:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        db.delete(landfill)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Landfill deleted successfully"})
    
class LandfillUpdateRequest(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: float
    current_capacity: float
    time_start: int
    time_end: int

@router.put("/{landfill_id}")
async def update_landfill(landfill_id: int, landfillReq: LandfillUpdateRequest, user: User = Depends(get_user_from_session)):

    if "edit_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 3:
            landfill = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).filter(LandfillManager.landfill_id == landfill_id).first()
            if not landfill:
                return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        else:
            landfill = db.query(Landfill).filter(Landfill.id == landfill_id).first()
        if not landfill:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        db.query(Landfill).filter(Landfill.id == landfill_id).update({
            "name": landfillReq.name,
            "latitude": landfillReq.latitude,
            "longitude": landfillReq.longitude,
            "capacity": landfillReq.capacity,
            "current_capacity": landfillReq.current_capacity,
            "time_start": landfillReq.time_start,
            "time_end": landfillReq.time_end
        })
        
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Landfill updated successfully"})
    

class LandfillManagerRequest(BaseModel):
    landfill_id: int
    user_id: List[int]

@router.post("/manager")
async def assign_manager(lanfillManager: LandfillManagerRequest, user: User = Depends(get_user_from_session)):
    """
    Assign only for STS managers and Unassigned users.
    Will reassign the managers of existing STS manager.
    """
    if "assign_role_to_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        # delete all previous managers but dont commit
        db.query(LandfillManager).filter(LandfillManager.landfill_id == lanfillManager.landfill_id).delete()
        for user_id in lanfillManager.user_id:

            # check if user_id is either a landfill manager or a Unassigned
            user = db.query(User).filter(User.id == user_id).first()
            if user is None:
                return JSONResponse(status_code=404, content={"message": "User not found"})

            if user.role_id != 3 and user.role_id != 0:
                return JSONResponse(status_code=400, content={"message": "User is not a landfill manager or Unassigned"})

            if user.role_id == 3:
                # check if user is already a landfill manager of another landfill
                # if yes, then remove that landfill manager and assign to this landfill
                landfill = db.query(LandfillManager).filter(LandfillManager.user_id == user_id).first()
                if landfill is not None:
                    db.query(LandfillManager).filter(LandfillManager.user_id == user_id).delete()
                    
            if user.role_id == 0:
                # update the role to landfill manager
                db.query(User).filter(User.id == user_id).update({"role_id": 3})


            db.add(LandfillManager(
                landfill_id=lanfillManager.landfill_id,
                user_id=user_id
            ))
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Landfill manager assigned successfully"})


@router.get("/available")
async def available_landfil(weight: float = Query(None), user: User = Depends(get_user_from_session)):
    if "list_available_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    if weight is None:
        return JSONResponse(status_code=400, content={"message": "Must specify weight."})
    
    with SessionLocal() as db:

        # get now hour in 24 format
        now = datetime.utcnow()
        current_hour = now.hour + 6

        landfills = db.query(Landfill).filter(Landfill.current_capacity >= weight).filter(Landfill.time_start <= current_hour).filter(Landfill.time_end >= current_hour).all()
        
        response = []
        for lf in landfills:
            response.append({
                "id": lf.id,
                "name": lf.name,
                "latitude": lf.latitude,
                "longitude": lf.longitude,
                "capacity": lf.capacity,
                "current_capacity": lf.current_capacity,
                "time_start": lf.time_start,
                "time_end": lf.time_end
            })
    
        return JSONResponse(status_code=200, content=response)