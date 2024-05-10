from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Employee, CollectionPlan, EmployeeActivity
from app.config import SessionLocal
import os
from datetime import datetime, timedelta
router = APIRouter(
    prefix="/activity",
    tags=["activity"],
    responses={404: {"description": "Route not found"}},
)


class EmployeeActivityRequest(BaseModel):
    employee_id: int
    day_of_absence: int # epoch time

@router.post("/absent")
async def absent_employees( employeeActivityReq :EmployeeActivityRequest, user: User = Depends(get_user_from_session)):
    if "edit_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        latest_activity_id = 1
        latest_activity = db.query(EmployeeActivity).order_by(EmployeeActivity.id.desc()).first()
        if latest_activity:
            latest_activity_id += latest_activity.id + 1


        newEmployeeActivity = EmployeeActivity(
            id=latest_activity_id,
            employee_id=employeeActivityReq.employee_id,
            date=employeeActivityReq.day_of_absence,
            is_absent=1
        )

        db.add(newEmployeeActivity)
        db.commit()
        

        return JSONResponse(status_code=201, content={"message": "Employee marked as absent"})
    

# on leave


class EmployeeLeaveActivityRequest(BaseModel):
    employee_id: int
    start_day_of_absence: int # epoch time
    end_day_of_absence: int # epoch time

@router.post("/leave")
async def absent_employees( employeeActivityReq :EmployeeLeaveActivityRequest, user: User = Depends(get_user_from_session)):
    if "edit_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        latest_activity_id = 1
        latest_activity = db.query(EmployeeActivity).order_by(EmployeeActivity.id.desc()).first()
        if latest_activity:
            latest_activity_id += latest_activity.id + 1

        # get epochs of all days between start and end
        start_day = datetime.fromtimestamp(employeeActivityReq.start_day_of_absence)
        end_day = datetime.fromtimestamp(employeeActivityReq.end_day_of_absence)
        days = (end_day - start_day).days + 1
        absent_days = []
        for i in range(days):
            absent_day = start_day + timedelta(days=i)
            absent_day_epoch = int(absent_day.timestamp())
            absent_days.append(absent_day_epoch)

        for day in absent_days:
            newEmployeeActivity = EmployeeActivity(
                id=latest_activity_id,
                employee_id=employeeActivityReq.employee_id,
                date=day,
                is_on_leave=1
            )

            latest_activity_id += 1

            db.add(newEmployeeActivity)
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Employee marked as on leave"})
    


# get activity of an employee
@router.get("/employee/{employee_id}")
async def get_employee_activity(employee_id: int, user: User = Depends(get_user_from_session)):
    if "list_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        activities = db.query(EmployeeActivity).filter(EmployeeActivity.employee_id == employee_id).all()
        response = []
        for activity in activities:
            response.append({
                "id": activity.id,
                "employee": {
                    "id": activity.employee.id,
                    "name": activity.employee.user.name
                },
                "date": activity.date,
                "is_absent": activity.is_absent,
                "is_on_leave": activity.is_on_leave,
                "logout": activity.logout,
                "login": activity.login,
                "work_duration": activity.work_duration,
                "plan": activity.plan_id
                
            })
        return JSONResponse(status_code=200, content=response)
    