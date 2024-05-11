from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, STS, Contract, CollectionPlan, ContractManager, Employee
from app.config import SessionLocal
from datetime import datetime


router = APIRouter(
    prefix="/plan",
    tags=["plan"],
    responses={404: {"description": "Route not found"}},
)


@router.get("/")
async def get_collection_plan(user: User = Depends(get_user_from_session)):

    if "list_plan" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        collection_plans = []

        if user["role"]["id"] == 4: # Contract Manager
            # get contract id from contract manager table
            contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first()
            collection_plans = db.query(CollectionPlan).filter(CollectionPlan.contract_id == contract.contract_id).all()

        elif user["role"]["id"] == 1: # Super Admin
            collection_plans = db.query(CollectionPlan).all()

        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        response = []
        for collection_plan in collection_plans:
            employee = db.query(Employee).filter(Employee.plan_id == collection_plan.id).all()
            employee_count = len(employee)
            response.append({
                "id": collection_plan.id,
                "area_of_collection": collection_plan.area_of_collection,
                "ward": collection_plan.ward,
                "contract": {
                    "id": collection_plan.contract.id,
                    "name": collection_plan.contract.name,
                },
                "start_time_hr": collection_plan.start_time_hr,
                "start_time_min": collection_plan.start_time_min,
                "duration": collection_plan.duration,
                "no_of_labour": collection_plan.no_of_labour,
                "no_of_vehicle": collection_plan.no_of_vehicle,
                "daily_waste_ton": collection_plan.daily_waste_ton,
                "employee_count": employee_count

            })


        return JSONResponse(status_code=200, content=response)
    

class CollectionPlanRequest(BaseModel):
        area_of_collection: str
        start_time_hr: int
        start_time_min: int
        duration: int
        no_of_vehicle: int
        daily_waste_ton: float
        ward: str


@router.post("/")
async def create_collection_plan(
    collection_plan: CollectionPlanRequest,
    user: User = Depends(get_user_from_session)
):

    if "create_plan" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        # only contract manager can create collection plan
        
        contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first()
        
        if not contract:
            return JSONResponse(status_code=400, content={"message": "Contract not found"})
        
        contract_id = contract.contract_id

        collection_id = 1
        latest_collection_plan = db.query(CollectionPlan).order_by(CollectionPlan.id.desc()).first()
        if latest_collection_plan:
            collection_id = latest_collection_plan.id + 1

        new_collection_plan = CollectionPlan(
            id=collection_id,
            area_of_collection=collection_plan.area_of_collection,
            start_time_hr=collection_plan.start_time_hr,
            start_time_min=collection_plan.start_time_min,
            duration=collection_plan.duration,
            no_of_labour=0,
            no_of_vehicle=collection_plan.no_of_vehicle,
            daily_waste_ton=collection_plan.daily_waste_ton,
            contract_id=contract_id,
            ward=collection_plan.ward
        )

        db.add(new_collection_plan)
        db.commit()

        return JSONResponse(status_code=201, content={"message": "Collection Plan created successfully"})
    


class CollectionPlanUpdateRequest(BaseModel):
    area_of_collection: str
    start_time_hr: int
    start_time_min: int
    duration: int
    no_of_vehicle: int
    daily_waste_ton: float
    ward: str


@router.put("/{plan_id}")
async def update_collection_plan(
    plan_id: int,
    collection_plan: CollectionPlanUpdateRequest,
    user: User = Depends(get_user_from_session)
):

    if "edit_plan" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        # only contract manager can update collection plan
        contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first()
        
        if not contract:
            return JSONResponse(status_code=400, content={"message": "Contract not found"})
        
        collection_plan = db.query(CollectionPlan).filter(CollectionPlan.id == plan_id).first()
        
        if not collection_plan:
            return JSONResponse(status_code=400, content={"message": "Collection Plan not found"})
        
        collection_plan.area_of_collection = collection_plan.area_of_collection
        collection_plan.start_time_hr = collection_plan.start_time_hr
        collection_plan.start_time_min = collection_plan.start_time_min
        collection_plan.duration = collection_plan.duration
        collection_plan.no_of_vehicle = collection_plan.no_of_vehicle
        collection_plan.daily_waste_ton = collection_plan.daily_waste_ton
        collection_plan.ward = collection_plan.ward

        db.commit()

        return JSONResponse(status_code=200, content={"message": "Collection Plan updated successfully"})
    


@router.delete("/{plan_id}")
async def delete_collection_plan(
    plan_id: int,
    user: User = Depends(get_user_from_session)
):

    if "delete_plan" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        # only contract manager can delete collection plan
        contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first()
        
        if not contract:
            return JSONResponse(status_code=400, content={"message": "Contract not found"})
        
        collection_plan = db.query(CollectionPlan).filter(CollectionPlan.id == plan_id).first()
        
        if not collection_plan:
            return JSONResponse(status_code=400, content={"message": "Collection Plan not found"})
        
        db.delete(collection_plan)
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Collection Plan deleted successfully"})