from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import Transfer, Vehicle, STS, Landfill, User, STSmanager, LandfillManager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/transfer",
    tags=["transfer"],
    responses={404: {"description": "Route not found"}},
)

def get_status_desc(status_id):
    if status_id == 1:
        return "Departed from sts"
    elif status_id == 2:
        return "Arrived at landfill"
    elif status_id == 3:
        return "Departed from landfill"
    elif status_id == 4:
        return "Trip completed"
    else:
        return "Invalid Status"

@router.get("/")
async def get_transfers(user: User = Depends(get_user_from_session)):

    if "view_transfer" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 1: # Admin
            transfers = db.query(Transfer).all()
        elif user["role"]["id"] == 2: # STS
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            transfers = db.query(Transfer).filter(Transfer.sts_id == sts.sts_id).all()
        elif user["role"]["id"] == 3: # Landfill
            landfill = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).first()
            if landfill is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            transfers = db.query(Transfer).filter(Transfer.landfill_id == landfill.landfill_id).all()

        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})


        response = []
        for t in transfers:
            response.append({
                "id": t.id,
                "vehicle": {
                    "id": t.vehicle.id,
                    "reg_no": t.vehicle.reg_no,
                    "capacity": t.vehicle.capacity,
                    "vtype": t.vehicle.vtype,
                    "loaded_cost": t.vehicle.loaded_cost,
                    "empty_cost": t.vehicle.empty_cost
                },
                "sts": {
                    "id": t.sts.id,
                    "name": t.sts.name,
                    "ward_no": t.sts.ward_no,
                    "latitude": t.sts.latitude,
                    "longitude": t.sts.longitude
                },
                "landfill": {
                    "id": t.landfill.id,
                    "name": t.landfill.name,
                    "latitude": t.landfill.latitude,
                    "longitude": t.landfill.longitude,
                    "capacity": t.landfill.capacity,
                    "current_capacity": t.landfill.current_capacity
                },

                "sts_departure_time": t.sts_departure_time,
                "sts_departure_weight": t.sts_departure_weight,
                "oil": t.oil,
                "landfill_arrival_time": t.landfill_arrival_time,
                "landfill_arrival_weight": t.landfill_arrival_weight,
                "landfill_departure_time": t.landfill_departure_time,
                "sts_arrival_time": t.sts_arrival_time,
                "status": {
                    "id": t.status,
                    "desc": get_status_desc(t.status)
                }
                
            })

        return JSONResponse(status_code=200, content=response)


class STSdeparture(BaseModel):
    sts_id: int
    vehicle_id: int
    landfill_id: int
    weight: float
    oil: float

@router.post("/sts/departure")
async def sts_departure(transfer: STSdeparture, user: User = Depends(get_user_from_session)):
    if "update_transfer_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        sts = db.query(STS).filter(STS.id == transfer.sts_id).first()
        if sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == transfer.vehicle_id).first()
        if vehicle is None:
            return JSONResponse(status_code=404, content={"message": "Vehicle not found"})
        
        # TODO: check for vehicle availability
        
        landfill = db.query(Landfill).filter(Landfill.id == transfer.landfill_id).first()
        if landfill is None:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        # check if landfil has capacity
        if landfill.current_capacity < transfer.weight:
            return JSONResponse(status_code=400, content={"message": "Not enough capacity for landfill."})
        
        newTransfer = Transfer(
            sts_id=transfer.sts_id,
            vehicle_id=transfer.vehicle_id,
            landfill_id=transfer.landfill_id,
            sts_departure_time=int(datetime.now().timestamp()),
            sts_departure_weight=transfer.weight,
            oil=transfer.oil,
            status=1 # Departed from sts
        )
        db.add(newTransfer)

        # Update vehicle availability
        vehicle.available = 0

        # Update landfil capacity
        landfill.current_capacity = landfill.current_capacity - transfer.weight
        
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Transfer added successfully"})
    

class LandfillArrival(BaseModel):
    weight: float

@router.patch("/landfill/arrival/{transfer_id}")
async def landfill_arrival(transfer_id: int, arrival: LandfillArrival, user: User = Depends(get_user_from_session)):
    if "update_transfer_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 1: # Must progress from "STS Departure"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.landfill_arrival_time = int(datetime.now().timestamp())
        transfer.landfill_arrival_weight = arrival.weight
        transfer.status = 2 # Arrived at landfill
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})

@router.patch("/landfill/departure/{transfer_id}")
async def landfill_departure(transfer_id: int, user: User = Depends(get_user_from_session)):
    if "update_transfer_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 2: # Must progress from "Landfill arrival"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.landfill_departure_time = int(datetime.now().timestamp())
        transfer.status = 3 # Departed from landfill
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})
    
@router.patch("/sts/arrival/{transfer_id}")
async def sts_arrival(transfer_id: int, user: User = Depends(get_user_from_session)):
    if "update_transfer_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 3: # Must progress from "Landfill departure"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.sts_arrival_time = int(datetime.now().timestamp())
        transfer.status = 4 # Trip completed

        # Update vehicle availability
        vehicle = db.query(Vehicle).filter(Vehicle.id == transfer.vehicle_id).first()
        vehicle.available = 1
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})
