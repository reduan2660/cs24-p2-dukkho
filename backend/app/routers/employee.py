from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Employee, CollectionPlan, EmployeeActivity
from app.config import SessionLocal
import os
from datetime import datetime

router = APIRouter(
    prefix="/employee",
    tags=["employee"],
    responses={404: {"description": "Route not found"}},
)


from passlib.context import CryptContext
SECRET_KEY     = os.getenv("SECRET_KEY")
HASH_ALGORITHM = "HS256"
SUPERADMIN_PASSWORD = os.getenv("SUPERADMIN_PASSWORD")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class EmployeeRequest(BaseModel):
    name: str
    email: str
    password: str
    username: str
    contact: str
    date_of_birth: int
    date_of_hire: int
    job_title: str
    pay_per_hour: float
    plan_id: int


@router.post("/")
async def create_employee(employeeReq: EmployeeRequest, user: User = Depends(get_user_from_session)):

    if "create_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:

        # create a user
        latest_user_id = db.query(User).order_by(User.id.desc()).first().id

        # check if email already exists
        email_exists = db.query(User).filter(User.email == employeeReq.email).first()
        if email_exists:
            return JSONResponse(status_code=400, content={"message": "Email already exists"})
        
        new_user_id = latest_user_id + 1

        newUser = User(
            id=new_user_id,
            name=employeeReq.name,
            email=employeeReq.email,
            password=pwd_context.hash(employeeReq.password),
            username=employeeReq.username,
            contact=employeeReq.contact,
            role_id=5, # employee
            created_at=int(datetime.utcnow().timestamp())
        )
        db.add(newUser)



        employee = Employee(
            user_id=new_user_id,
            date_of_birth=employeeReq.date_of_birth,
            date_of_hire=employeeReq.date_of_hire,
            job_title=employeeReq.job_title,
            pay_per_hour=employeeReq.pay_per_hour,
            plan_id=employeeReq.plan_id
        )
        db.add(employee)
        db.commit()

        return JSONResponse(status_code=201, content={"message": "Employee created successfully"})
    


# list
@router.get("/")
async def get_all_employees(user: User = Depends(get_user_from_session)):

    if "list_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        employees = db.query(Employee).all()

        response = []
        for e in employees:
            user = db.query(User).filter(User.id == e.user_id).first()
            response.append({
                "id": e.id,
                "name": user.name,
                "email": user.email,
                "username": user.username,
                "contact": user.contact,
                "date_of_birth": e.date_of_birth,
                "date_of_hire": e.date_of_hire,
                "job_title": e.job_title,
                "pay_per_hour": e.pay_per_hour,
                "plan_id": {
                    "id": e.plan_id,
                    "name": db.query(CollectionPlan).filter(CollectionPlan.id == e.plan_id).first().area_of_collection
                },
                "activities": [
                    {
                        "id": a.id,
                        "date": a.date,
                        "is_absent": a.is_absent,
                        "is_on_leave": a.is_on_leave,
                        "logout": a.logout,
                        "login": a.login,
                        "work_duration": a.work_duration,
                        "plan": a.plan_id
                    } for a in db.query(EmployeeActivity).filter(EmployeeActivity.employee_id == e.id).order_by(EmployeeActivity.date.desc()).all()
                ]
            })

        return JSONResponse(status_code=200, content=response)
    


class EmployeeUpdateRequest(BaseModel):
    name: str
    email: str
    username: str
    contact: str
    date_of_birth: int
    date_of_hire: int
    job_title: str
    pay_per_hour: float
    plan_id: int


@router.put("/{employee_id}")
async def update_employee(employee_id: int, employeeReq: EmployeeUpdateRequest, user: User = Depends(get_user_from_session)):

    if "edit_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            return JSONResponse(status_code=404, content={"message": "Employee not found"})
        
        user = db.query(User).filter(User.id == employee.user_id).first()
        if not user:
            return JSONResponse(status_code=404, content={"message": "User not found"})


        db.query(User).filter(User.id == employee.user_id).update({
            "name": employeeReq.name,
            "email": employeeReq.email,
            "username": employeeReq.username,
            "contact": employeeReq.contact
        })
        db.commit()

        db.query(Employee).filter(Employee.id == employee_id).update({
            "date_of_birth": employeeReq.date_of_birth,
            "date_of_hire": employeeReq.date_of_hire,
            "job_title": employeeReq.job_title,
            "pay_per_hour": employeeReq.pay_per_hour,
            "plan_id": employeeReq.plan_id
        })
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Employee updated successfully"})
    


@router.delete("/{employee_id}")
async def delete_employee(employee_id: int, user: User = Depends(get_user_from_session)):

    if "delete_employee" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

    with SessionLocal() as db:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            return JSONResponse(status_code=404, content={"message": "Employee not found"})
        
        user = db.query(User).filter(User.id == employee.user_id).first()
        if not user:
            return JSONResponse(status_code=404, content={"message": "User not found"})

        db.query(User).filter(User.id == employee.user_id).delete()
        db.commit()

        db.query(Employee).filter(Employee.id == employee_id).delete()
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Employee deleted successfully"})