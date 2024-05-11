from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, STS, Contract, ContractManager, CollectionPlan, Employee
from app.config import SessionLocal
from datetime import datetime


router = APIRouter(
    prefix="/contract",
    tags=["contract"],
    responses={404: {"description": "Route not found"}},
)


@router.get("/")
async def get_contract(user: User = Depends(get_user_from_session)):

    if "list_contract" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        contracts = db.query(Contract).all()
        
        response = []
        for contract in contracts:
            plans = db.query(CollectionPlan).filter(CollectionPlan.contract_id == contract.id).all()
            employee_count = 0
            for all_plans in plans:
                employee = db.query(Employee).filter(Employee.plan_id == all_plans.id).all()
                employee_count += len(employee)
                


            response.append({
                "id": contract.id,
                "sts": {
                    "id": contract.sts.id,
                    "name": contract.sts.name,
                },
                "name": contract.name,
                "reg_id": contract.reg_id,
                "reg_date": contract.reg_date,
                "tin": contract.tin,
                "contact": contract.contact,
                "workforce_size": employee_count,
                "pay_per_ton": contract.pay_per_ton,
                "required_waste_ton": contract.required_waste_ton,
                "contract_duration": contract.contract_duration,
                "area_of_collection": contract.area_of_collection,
                "managers": [
                    {
                        "id": m.user_id,
                        "name": m.user.name,
                        "email": m.user.email
                    } for m in db.query(ContractManager).filter(ContractManager.contract_id == contract.id).all()
                ]

            })


        return JSONResponse(status_code=200, content=response)
    

class ContractRequest(BaseModel):
    name: str
    sts_id: int
    reg_id: str
    reg_date: int
    tin: str
    contact: str
    workforce_size: int
    pay_per_ton: float
    required_waste_ton: float
    contract_duration: int
    area_of_collection: str


@router.post("/")
async def create_contract(contract: ContractRequest, user: User = Depends(get_user_from_session)):

    if "create_contract" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        sts = db.query(STS).filter(STS.id == contract.sts_id).first()
        if sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        

        contract_id = 1
        latest_contract = db.query(Contract).order_by(Contract.id.desc()).first()
        if latest_contract:
            contract_id = latest_contract.id + 1

        contract = Contract(
            id=contract_id,
            name=contract.name,
            sts_id=contract.sts_id,
            reg_id=contract.reg_id,
            reg_date=contract.reg_date,
            tin=contract.tin,
            contact=contract.contact,
            workforce_size=contract.workforce_size,
            pay_per_ton=contract.pay_per_ton,
            required_waste_ton=contract.required_waste_ton,
            contract_duration=contract.contract_duration,
            area_of_collection=contract.area_of_collection,
        )
        db.add(contract)
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Contract created successfully"})
    


class ContractUpdateRequest(BaseModel):
    name: str
    sts_id: int
    reg_id: str
    reg_date: int
    tin: str
    contact: str
    workforce_size: int
    pay_per_ton: float
    required_waste_ton: float
    contract_duration: int
    area_of_collection: str

@router.put("/{contract_id}")
async def update_contract(contract_id: int, contract: ContractUpdateRequest, user: User = Depends(get_user_from_session)):

    if "edit_contract" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            return JSONResponse(status_code=404, content={"message": "Contract not found"})
        
        sts = db.query(STS).filter(STS.id == contract.sts_id).first()
        if sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        db.query(Contract).filter(Contract.id == contract_id).update({
            "name": contract.name,
            "sts_id": contract.sts_id,
            "reg_id": contract.reg_id,
            "reg_date": contract.reg_date,
            "tin": contract.tin,
            "contact": contract.contact,
            "workforce_size": contract.workforce_size,
            "pay_per_ton": contract.pay_per_ton,
            "required_waste_ton": contract.required_waste_ton,
            "contract_duration": contract.contract_duration,
            "area_of_collection": contract.area_of_collection
        })
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Contract updated successfully"})
    

@router.delete("/{contract_id}")
async def delete_contract(contract_id: int, user: User = Depends(get_user_from_session)):

    if "delete_contract" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        contract = db.query(Contract).filter(Contract.id == contract_id).first()
        if not contract:
            return JSONResponse(status_code=404, content={"message": "Contract not found"})
        
        db.delete(contract)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Contract deleted successfully"})
    

class ContractManagerRequest(BaseModel):
    contract_id: int
    user_id: List[int]

@router.post("/manager")
async def add_contract_manager(contrantManagerReq: ContractManagerRequest, user: User = Depends(get_user_from_session)):

    if "assign_role_to_user" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        # delete all previous managers but dont commit
        db.query(ContractManager).filter(ContractManager.contract_id == contrantManagerReq.contract_id).delete()

        for user_id in contrantManagerReq.user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return JSONResponse(status_code=404, content={"message": "User not found"})
            
            if user.role_id != 4 and user.role_id != 0:
                return JSONResponse(status_code=400, content={"message": "User is not a Contract manager or Unassigned"})
            
            # check if manager already exists
            # if yes, then remove that manager and assign to this contract
            manager = db.query(ContractManager).filter(ContractManager.user_id == user_id).first()
            if manager is not None:
                db.query(ContractManager).filter(ContractManager.user_id == user_id).delete()

            if user.role_id == 0:
                # update the role to Contract manager
                db.query(User).filter(User.id == user_id).update({"role_id": 4})

            contract_manager = ContractManager(
                contract_id=contrantManagerReq.contract_id,
                user_id=user_id
            )
            db.add(contract_manager)
        
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Manager added successfully"})