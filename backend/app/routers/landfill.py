from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Landfill, LandfillManager
from app.config import SessionLocal

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

@router.post("/")
async def create_landfill(landfill: Landfillrequest, user: User = Depends(get_user_from_session)):

    if "create_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        db.add(Landfill(
            name=landfill.name,
            latitude=landfill.latitude,
            longitude=landfill.longitude,
            capacity=landfill.capacity,
            current_capacity=landfill.capacity
        ))
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Landfill created successfully"})
    

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

@router.put("/{landfill_id}")
async def update_landfill(landfill_id: int, landfillReq: LandfillUpdateRequest, user: User = Depends(get_user_from_session)):

    if "edit_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        landfill = db.query(Landfill).filter(Landfill.id == landfill_id).first()
        if not landfill:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        db.query(Landfill).filter(Landfill.id == landfill_id).update({
            "name": landfillReq.name,
            "latitude": landfillReq.latitude,
            "longitude": landfillReq.longitude,
            "capacity": landfillReq.capacity,
            "current_capacity": landfillReq.current_capacity
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

        landfills = db.query(Landfill).filter(Landfill.current_capacity >= weight).all()

        response = []
        for lf in landfills:
            response.append({
                "id": lf.id,
                "name": lf.name,
                "latitude": lf.latitude,
                "longitude": lf.longitude,
                "capacity": lf.capacity,
                "current_capacity": lf.current_capacity
            })
    
        return JSONResponse(status_code=200, content=response)