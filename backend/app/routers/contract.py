from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, STS, Contract
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
                "workforce_size": contract.workforce_size,
                "pay_per_ton": contract.pay_per_ton,
                "required_waste_ton": contract.required_waste_ton,
                "contract_duration": contract.contract_duration,
                "area_of_collection": contract.area_of_collection,

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
        return JSONResponse(status_code=200, content={"message": "Contract created successfully"})
    


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

        contract.name = contract.name
        contract.sts_id = contract.sts_id
        contract.reg_id = contract.reg_id
        contract.reg_date = contract.reg_date
        contract.tin = contract.tin
        contract.contact = contract.contact
        contract.workforce_size = contract.workforce_size
        contract.pay_per_ton = contract.pay_per_ton
        contract.required_waste_ton = contract.required_waste_ton
        contract.contract_duration = contract.contract_duration
        contract.area_of_collection = contract.area_of_collection
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