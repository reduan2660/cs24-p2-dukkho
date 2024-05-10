from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, CollectionPlan, GarbageCollection, STS, ContractManager, Contract, EmployeeActivity, STSmanager, Employee
from app.config import SessionLocal
from datetime import datetime
from app.utils.schedule import cost_schedule
from app.utils.schedule_collection import time_schedule


router = APIRouter(
    prefix="/schedule",
    tags=["schedule"],
    responses={404: {"description": "Route not found"}},
)


@router.get("/cost")
async def get_cost(user: User = Depends(get_user_from_session)):

    if "schedule" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        # get contract if this user
        contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first().contract

        # get all collection plans for this contract
        collection_plans = db.query(CollectionPlan).filter(CollectionPlan.contract_id == contract.id).all()

        times = []
        duration = []
        plan_id = []
        for collection_plan in collection_plans:
            times.append(f"{collection_plan.start_time_hr}:{collection_plan.start_time_min}")
            duration.append(collection_plan.duration)
            plan_id.append(collection_plan.id)

        number_of_plans = len(collection_plans)


        employee_pay_rate = []
        employee_id = []
        for plan in plan_id:
            employees = db.query(Employee).filter(Employee.plan_id == plan).all()
            for employee in employees:
                employee_id.append(employee.id)
                employee_pay_rate.append(employee.pay_per_hour)

        number_of_employees = len(employee_id)

        sts_open = f"{contract.sts.time_start}:00"
        sts_close = f"{contract.sts.time_end}:00"



        min_cost, assigned, assignment = cost_schedule(times, duration, plan_id, number_of_plans, employee_pay_rate, employee_id, number_of_employees, sts_open, sts_close)

        response = []
        # travase the keys of the assignment dictionary
        for key in assignment.keys():

            plan_id = key
            emp_id = assignment[key]

            plan = db.query(CollectionPlan).filter(CollectionPlan.id == plan_id).first()
            employee = db.query(Employee).filter(Employee.id == emp_id).first()

            response.append({
                "plan_id": {
                    "id": plan.id,
                    "area_of_collection": plan.area_of_collection,
                    "ward": plan.ward,
                    "contract": {
                        "id": plan.contract.id,
                        "name": plan.contract.name,
                    },
                    "start_time_hr": plan.start_time_hr,
                    "start_time_min": plan.start_time_min,
                    "duration": plan.duration,
                    "no_of_labour": plan.no_of_labour,
                    "no_of_vehicle": plan.no_of_vehicle,
                    "daily_waste_ton": plan.daily_waste_ton,
                
                },
                "employee": {
                    "id": employee.id,
                    "name": employee.user.name
                }
            })



        return JSONResponse(status_code=200, content={
            # "times": times,
            # "duration": duration,
            # "plan_id": plan_id,
            # "number_of_plans": number_of_plans,
            # "employee_pay_rate": employee_pay_rate,
            # "employee_id": employee_id,
            # "number_of_employees": number_of_employees,
            # "sts_open": sts_open,
            # "sts_close": sts_close,

            # "assigned": assigned,
            # "assignment": assignment,
            "min_cost": min_cost,
            "collections": response
        })
    

@router.get("/time")
async def get_time(user: User = Depends(get_user_from_session)):

    if "schedule" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        # get contract if this user
        contract = db.query(ContractManager).filter(ContractManager.user_id == user["id"]).first().contract

        # get all collection plans for this contract
        collection_plans = db.query(CollectionPlan).filter(CollectionPlan.contract_id == contract.id).all()

        times = []
        duration = []
        plan_id = []
        for collection_plan in collection_plans:
            times.append(f"{collection_plan.start_time_hr}:{collection_plan.start_time_min}")
            duration.append(collection_plan.duration)
            plan_id.append(collection_plan.id)

        number_of_plans = len(collection_plans)


        employee_pay_rate = []
        employee_id = []
        for plan in plan_id:
            employees = db.query(Employee).filter(Employee.plan_id == plan).all()
            for employee in employees:
                employee_id.append(employee.id)
                employee_pay_rate.append(employee.pay_per_hour)

        number_of_employees = len(employee_id)

        sts_open = f"{contract.sts.time_start}:00"
        sts_close = f"{contract.sts.time_end}:00"



        min_cost, assignment = time_schedule(times, duration, plan_id, number_of_plans, employee_pay_rate, employee_id, number_of_employees, sts_open, sts_close)

        response = []
        # travase the keys of the assignment dictionary
        for key in assignment.keys():

            plan_id = key
            emp_id = assignment[key][0]

            plan = db.query(CollectionPlan).filter(CollectionPlan.id == plan_id).first()
            employee = db.query(Employee).filter(Employee.id == emp_id).first()

            response.append({
                "plan_id": {
                    "id": plan.id,
                    "area_of_collection": plan.area_of_collection,
                    "ward": plan.ward,
                    "contract": {
                        "id": plan.contract.id,
                        "name": plan.contract.name,
                    },
                    "start_time_hr": plan.start_time_hr,
                    "start_time_min": plan.start_time_min,
                    "duration": plan.duration,
                    "no_of_labour": plan.no_of_labour,
                    "no_of_vehicle": plan.no_of_vehicle,
                    "daily_waste_ton": plan.daily_waste_ton,
                
                },
                "employee": {
                    "id": employee.id,
                    "name": employee.user.name
                }
            })



        return JSONResponse(status_code=200, content={
            # "times": times,
            # "duration": duration,
            # "plan_id": plan_id,
            # "number_of_plans": number_of_plans,
            # "employee_pay_rate": employee_pay_rate,
            # "employee_id": employee_id,
            # "number_of_employees": number_of_employees,
            # "sts_open": sts_open,
            # "sts_close": sts_close,

            # "assignment": assignment,
            "min_cost": min_cost,
            "collections": response
        })




        
        

