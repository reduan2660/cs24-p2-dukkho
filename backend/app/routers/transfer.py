from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import Transfer, Vehicle, STS, Landfill, User
from app.config import SessionLocal

router = APIRouter(
    prefix="/transfer",
    tags=["transfer"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_transfers(user: User = Depends(get_user_from_session)):

    if "list_all_transfers" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfers = db.query(Transfer).all()
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
                }
            })

        return JSONResponse(status_code=200, content=response)