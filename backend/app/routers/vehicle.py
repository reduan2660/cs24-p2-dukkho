from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Vehicle
from app.config import SessionLocal

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
        vehicle = db.query(Vehicle).all()
        response = []
        for v in vehicle:
            response.append({
                "id": v.id,
                "reg_no": v.reg_no,
                "capacity": v.capacity,
                "vtype": v.vtype,
                "loaded_cost": v.loaded_cost,
                "empty_cost": v.empty_cost,
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
            empty_cost=vehicle.empty_cost
        ))
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Vehicle created successfully"})

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