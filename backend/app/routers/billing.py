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
    from_date:int, # epoch
    user: User = Depends(get_user_from_session)
):
    
    if "billing" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first().sts
        start_time_epoch = from_date
        end_time_epoch = from_date + 86400

        # get all garbage collection entries for this sts in between start_time and end_time
        garbage_collections = db.query(GarbageCollection).filter(GarbageCollection.sts_id == sts.id).filter(GarbageCollection.collection_start_time >= start_time_epoch).filter(GarbageCollection.collection_end_time <= end_time_epoch).all()


        garbage_inflow = []
        contract_id = []

        for gc in garbage_collections:
            contract_id.append(gc.contract_id)
            garbage_inflow.append(gc.collected_weight)


        number_of_inflow = len(garbage_inflow)

        # get all contrats of this sts
        all_contracts = db.query(Contract).filter(Contract.sts_id == sts.id).all()
        contracts = []
        required_delivery = []
        payment_per_ton = []
        for contract in all_contracts:
            contracts.append(contract.id)
            required_delivery.append(contract.required_waste_ton)
            payment_per_ton.append(contract.pay_per_ton)

        number_of_contracts = len(contracts)
        fine_factor = sts.fine

        profit,deficit = sts_daily_billing(garbage_inflow,contract_id,number_of_inflow,contracts,required_delivery,payment_per_ton, number_of_contracts,fine_factor)

        response_profit = []
        for key in profit.keys():
            response_profit.append({
                "contract_id": key,
                "profit": profit[key]
            })

        response_deficit = []
        for key in deficit.keys():
            response_deficit.append({
                "contract_id": key,
                "deficit": deficit[key]
            })

        return ({
            # "garbage_inflow": garbage_inflow,
            # "contract_id": contract_id,
            # "number_of_inflow": number_of_inflow,
            # "contracts": contracts,
            # "required_delivery": required_delivery,
            # "payment_per_ton": payment_per_ton,
            # "number_of_contracts": number_of_contracts,
            # "fine_factor": fine_factor,
            # "profit": profit,
            # "deficit": deficit,
            "response_profit": response_profit,
            "response_deficit": response_deficit

        })

        
