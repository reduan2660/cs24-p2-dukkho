from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Vehicle, Transfer, STSmanager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/vehicle",
    tags=["vehicle"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_vehicle(user: User = Depends(get_user_from_session)):

    if "list_vehicle" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        if user["role"]["id"] == 1: # System Admin
            vehicle = db.query(Vehicle).all()
        elif user["role"]["id"] == 2: # STS Manager 
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            vehicle = db.query(Vehicle).filter(Vehicle.sts_id == sts.sts_id).all()
        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

        response = []
        for v in vehicle:
            response.append({
                "id": v.id,
                "reg_no": v.reg_no,
                "capacity": v.capacity,
                "vtype": v.vtype,
                "loaded_cost": v.loaded_cost,
                "empty_cost": v.empty_cost,
                "available": v.available,
                "sts": {
                    "id": v.sts.id,
                    "name": v.sts.name
                }
            })

        return JSONResponse(status_code=200, content=response)


class VehicleRequest(BaseModel):
    reg_no: str
    capacity: int
    vtype: str
    sts_id: int
    loaded_cost: float
    empty_cost: float

@router.post("/")
async def create_vehicle(vehicle: VehicleRequest, user: User = Depends(get_user_from_session)):

    if "create_vehicle" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        db.add(Vehicle(
            reg_no=vehicle.reg_no,
            capacity=vehicle.capacity,
            vtype=vehicle.vtype,
            sts_id=vehicle.sts_id,
            loaded_cost=vehicle.loaded_cost,
            empty_cost=vehicle.empty_cost,
            available=1
        ))
        db.commit()

        return JSONResponse(status_code=201, content={"message": "Vehicle created successfully"})

@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: int, user: User = Depends(get_user_from_session)):

    if "delete_vehicle" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        db.query(Vehicle).filter(Vehicle.id == vehicle_id).delete()
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Vehicle deleted successfully"})
    

@router.put("/{vehicle_id}")
async def update_vehicle(vehicle_id: int, vehicle: VehicleRequest, user: User = Depends(get_user_from_session)):

    if "edit_vehicle" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        db.query(Vehicle).filter(Vehicle.id == vehicle_id).update({
            "reg_no": vehicle.reg_no,
            "capacity": vehicle.capacity,
            "vtype": vehicle.vtype,
            "sts_id": vehicle.sts_id,
            "loaded_cost": vehicle.loaded_cost,
            "empty_cost": vehicle.empty_cost
        })
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Vehicle updated successfully"})
    

@router.get("/available")
async def get_available_vehicle(user: User = Depends(get_user_from_session)):
    """
    Only sts manager has permission to view available vehicles
    get sts id from user
    get vehicles with sts id and available = 1 from db
    check if there is more than 3 records of the vehicle in transfer table, if yes, remove the vehicle from the list
    """

    if "list_available_vehicle" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        # If user is system admin, return all available vehicles
        if user["role"]["id"] == 1: # System Admin
            vehicles = db.query(Vehicle).filter(Vehicle.available == 1).all()
        elif user["role"]["id"] == 2: # STS Manager
            # get sts from sts_manager table
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            
            vehicles = db.query(Vehicle).filter(Vehicle.sts_id == sts.sts_id).filter(Vehicle.available == 1).all()
        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        response = []
        for v in vehicles:
            # Check if there are more than 3 records of the vehicle for today in transfer table
            today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp()) # Get today's start timestamp
            transfer_count = db.query(Transfer).filter(Transfer.vehicle_id == v.id).filter(Transfer.sts_departure_time >= today_starts_timestamp).count()
            
            if transfer_count >= 3:
                continue

            response.append({
                "id": v.id,
                "reg_no": v.reg_no,
                "capacity": v.capacity,
                "vtype": v.vtype,
                "loaded_cost": v.loaded_cost,
                "empty_cost": v.empty_cost,
                "available": v.available,
                "sts": {
                    "id": v.sts.id,
                    "name": v.sts.name
                }
            })

        return JSONResponse(status_code=200, content=response)
