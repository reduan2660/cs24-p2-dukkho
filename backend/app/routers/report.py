from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import Transfer, Vehicle, STS, Landfill, User, STSmanager, LandfillManager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/report",
    tags=["report"],
    responses={404: {"description": "Route not found"}},
)

# Available Vehicles
@router.get("/available_vehicles")
def get_available_vehicles(user: User = Depends(get_user_from_session)):
    
    if "report_available_vehicles" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 1: # Admin
            vehicle_count = db.query(Vehicle).count()
        elif user["role"]["id"] == 2: # STS Manager
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            vehicle_count = db.query(Vehicle).filter(Vehicle.sts_id == sts.sts_id).count()

        return JSONResponse(status_code=200, content={"vehicle_count": vehicle_count})
    

