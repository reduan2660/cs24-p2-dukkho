from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, CollectionPlan, GarbageCollection, STS, ContractManager, Contract, EmployeeActivity, STSmanager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/collection",
    tags=["collection"],
    responses={404: {"description": "Route not found"}},
)



# Workflow
# 1. Contract manager says employee has started garbage collection
#    - new employee activity entry
#    - new garbage collection entry
#    - send notification to STS manager


# 2. STS manager says garbage collection has ended
#    - update garbage collection entry
#    - send notification to contract manager

# 3. Contract manager says garbage collection has ended
#    - update garbage collection entry
#    - send notification to STS manager

class GarbageCollectionRequest(BaseModel):
    employee_id: int
    collection_plan_id: int

@router.post("/")
async def start_collection(garbageCollectionReq: GarbageCollectionRequest, user: User = Depends(get_user_from_session)):
    if "start_collection" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        # check if employee exists
        employee = db.query(User).filter(User.id == garbageCollectionReq.employee_id).first()
        if not employee:
            return JSONResponse(status_code=400, content={"message": "Employee not found"})
        
        # check if collection plan exists
        collection_plan = db.query(CollectionPlan).filter(CollectionPlan.id == garbageCollectionReq.collection_plan_id).first()
        if not collection_plan:
            return JSONResponse(status_code=400, content={"message": "Collection Plan not found"})
        

        # create a new employee activity
        latest_activity_id = 1
        latest_activity = db.query(EmployeeActivity).order_by(EmployeeActivity.id.desc()).first()
        if latest_activity:
            latest_activity_id += latest_activity.id + 1

        new_activity = EmployeeActivity(
            id=latest_activity_id,
            employee_id=garbageCollectionReq.employee_id,
            date = int(datetime.utcnow().timestamp()),
            plan_id=garbageCollectionReq.collection_plan_id,
            login=int(datetime.utcnow().timestamp()),
            is_absent = 0,
            is_on_leave = 0
        )

        db.add(new_activity)


        # create a new garbage collection
        latest_collection_id = 1
        latest_collection = db.query(GarbageCollection).order_by(GarbageCollection.id.desc()).first()
        if latest_collection:
            latest_collection_id += latest_collection.id + 1

        contract_id = db.query(CollectionPlan).filter(CollectionPlan.id == garbageCollectionReq.collection_plan_id).first().contract_id
        sts_id = db.query(Contract).filter(Contract.id == contract_id).first().sts_id

        new_collection = GarbageCollection(
            id=latest_collection_id,
            
            employee_id = garbageCollectionReq.employee_id,
            collection_plan_id=garbageCollectionReq.collection_plan_id,
            contract_id = contract_id,
            sts_id=sts_id,
            collection_start_time=int(datetime.utcnow().timestamp()),
            status=0
        )

        db.add(new_collection)

        db.commit()


        return JSONResponse(status_code=201, content={"message": "Garbage collection started successfully"})
    


@router.get("/")
async def get_all_collections(user: User = Depends(get_user_from_session)):
    if "view_collection" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        collections = db.query(GarbageCollection).all()

        if user["role"]["id"] == 2:
            user_sts_id = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first().sts_id
            collections = db.query(GarbageCollection).filter(GarbageCollection.sts_id == user_sts_id).all()

        response = []

        for c in collections:
            employee = db.query(User).filter(User.id == c.employee_id).first()
            collection_plan = db.query(CollectionPlan).filter(CollectionPlan.id == c.collection_plan_id).first()
            response.append({
                "id": c.id,
                "employee": {
                    "id": employee.id,
                    "name": employee.name,
                    "email": employee.email,
                    "username": employee.username,
                    "contact": employee.contact
                },
                "collection_plan": {
                    "id": collection_plan.id,
                    "area_of_collection": collection_plan.area_of_collection,
                    "start_time_hr": collection_plan.start_time_hr,
                    "start_time_min": collection_plan.start_time_min,
                    "duration": collection_plan.duration,
                    "no_of_vehicle": collection_plan.no_of_vehicle,
                    "daily_waste_ton": collection_plan.daily_waste_ton,
                    "ward": collection_plan.ward
                },
                "sts": {
                    "id": c.sts_id,
                    "name": c.sts.name
                },
                "contract": {
                    "id": c.contract_id,
                    "name": c.contract.name
                },
                "collection_start_time": c.collection_start_time,
                "collection_end_time": c.collection_end_time,
                "collected_weight": c.collected_weight,
                "vehicle": c.vehicle,

                "status": c.status
            })

        return JSONResponse(status_code=200, content=response)
    


class GarbageCollectionUpdateRequest(BaseModel):
    collected_weight: float
    vehicle: str

@router.put("/{collection_id}")
async def arrived_collection(collection_id: int, garbageCollectionReq: GarbageCollectionUpdateRequest, user: User = Depends(get_user_from_session)):
    if "arrived_collection" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        collection = db.query(GarbageCollection).filter(GarbageCollection.id == collection_id).first()
        if not collection:
            return JSONResponse(status_code=404, content={"message": "Collection not found"})
        
        if collection.status == 1:
            return JSONResponse(status_code=400, content={"message": "Collection already ended"})
        
        db.query(GarbageCollection).filter(GarbageCollection.id == collection_id).update({
            "collection_end_time": int(datetime.utcnow().timestamp()),
            "collected_weight": garbageCollectionReq.collected_weight,
            "vehicle": garbageCollectionReq.vehicle,
            "status": 1
        })


        # update capacity of STS
        sts = db.query(STS).filter(STS.id == collection.sts_id).first()
        sts.capacity -= garbageCollectionReq.collected_weight / 1000
        db.query(STS).filter(STS.id == collection.sts_id).update({
            "capacity": sts.capacity
        })

        db.commit()

        return JSONResponse(status_code=200, content={"message": "Garbage collection ended successfully"})



# 3. Contract manager says garbage collection has ended

@router.patch("/{collection_id}")

async def end_collection_by_contract_manager(collection_id: int, user: User = Depends(get_user_from_session)):
    if "end_collection" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        collection = db.query(GarbageCollection).filter(GarbageCollection.id == collection_id).first()
        if not collection:
            return JSONResponse(status_code=404, content={"message": "Collection not found"})

        db.query(GarbageCollection).filter(GarbageCollection.id == collection_id).update({
            "collection_end_time": int(datetime.utcnow().timestamp()),
            "status": 2
        })

        # update employee activity
        activity = db.query(EmployeeActivity).filter(EmployeeActivity.employee_id == collection.employee_id).order_by(EmployeeActivity.id.desc()).first()

        work_duration_minute = (int(datetime.utcnow().timestamp()) - activity.login) / 60
        db.query(EmployeeActivity).filter(EmployeeActivity.id == activity.id).update({
            "logout": int(datetime.utcnow().timestamp()),
            "work_duration": work_duration_minute
        })

        db.commit()

        return JSONResponse(status_code=200, content={"message": "Garbage collection ended successfully"})



