from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, CollectionPlan, GarbageCollection, STS, ContractManager, Contract, EmployeeActivity, STSmanager, Employee
from app.config import SessionLocal
from datetime import datetime
from app.utils.billing import sts_daily_billing


router = APIRouter(
    prefix="/billi",
    tags=["billi"],
    responses={404: {"description": "Route not found"}},
)

@router.get("/")
async def get_bill(
    date:int,
    user: User = Depends(get_user_from_session)
):
    
    if "billing" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first().sts