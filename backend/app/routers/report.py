from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import Transfer, Vehicle, STS, Landfill, User, STSmanager, LandfillManager
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/report",
    tags=["report"],
    responses={404: {"description": "Route not found"}},
)

# Available Vehicles
@router.get("/available_vehicles")
def get_available_vehicles(user: User = Depends(get_user_from_session)):
    
    if "report_available_vehicles" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 1: # Admin
            vehicle_count = db.query(Vehicle).count()
        elif user["role"]["id"] == 2: # STS Manager
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            vehicle_count = db.query(Vehicle).filter(Vehicle.sts_id == sts.sts_id).count()

        return JSONResponse(status_code=200, content={"count": vehicle_count})
    
# Vehicles in Transfer
@router.get("/vehicles_in_transfer")
def get_vehicles_in_transfer(user: User = Depends(get_user_from_session)):
    
    if "report_vehicles_in_transfer" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 1: # Admin
            vehicle_count = db.query(Transfer).filter(Transfer.status < 4).count()
        elif user["role"]["id"] == 2: # STS Manager
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            vehicle_count = db.query(Transfer).filter(Transfer.sts_id == sts.sts_id, Transfer.status < 4).count()
        elif user["role"]["id"] == 3: # Landfill Manager
            landfill = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).first()
            if landfill is None:
                return JSONResponse(status_code=404, content={"message": "Landfill not found"})
            vehicle_count = db.query(Transfer).filter(Transfer.landfill_id == landfill.landfill_id, Transfer.status < 4).count()

        return JSONResponse(status_code=200, content={"count": vehicle_count})

# Total sts
@router.get("/total_sts")
def get_total_sts(user: User = Depends(get_user_from_session)):
    
    if "report_total_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] in [1, 3]: # Admin, Landfill Manager
            sts_count = db.query(STS).count()
        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

        return JSONResponse(status_code=200, content={"count": sts_count})
    
# Total landfill
@router.get("/total_landfill")
def get_total_landfill(user: User = Depends(get_user_from_session)):
    
    if "report_total_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
            
            if user["role"]["id"] in [1, 2]: # Admin, STS Manager
                landfill_count = db.query(Landfill).count()
            else:
                return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

            return JSONResponse(status_code=200, content={"count": landfill_count})



# Total waste transfer by Landfill - per day - 7 days
# Access: Admin, Landfill Manager ( only for their landfill)
@router.get("/total_waste_transfer_by_landfill")
def get_total_waste_transfer_by_landfill( landfill_id: int = Query(None), user: User = Depends(get_user_from_session)):
        
        if "report_total_waste_transfer_by_landfill" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        with SessionLocal() as db:
            
            if user["role"]["id"] in [1, 3]: # Admin
                today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp()) # Get today's start timestamp
                last_7_days_timestamp = []
                last_7_days_timestamp.append(today_starts_timestamp)
                for i in range(1, 8):
                    last_7_days_timestamp.append(today_starts_timestamp - (i * 86400))
                
                transfer_response = []
                for ts in last_7_days_timestamp:
                    transfer_count = -1

                    if user["role"]["id"] == 3: # Landfill Manager
                        landfill_manager = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).first()
                        if landfill_manager is None:
                            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
                        landfill = db.query(Landfill).filter(Landfill.id == landfill_manager.landfill_id).first()
                        if landfill is None:
                            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
                        transfer_count = db.query(Transfer).filter(Transfer.landfill_id == landfill.id, Transfer.landfill_arrival_time >= ts, Transfer.landfill_arrival_time < ts + 86400).count()

                    elif landfill_id is not None:
                        landfill = db.query(Landfill).filter(Landfill.id == landfill_id).first()
                        if landfill is None:
                            return JSONResponse(status_code=400, content={"message": "Landfill not found"})
                        transfer_count = db.query(Transfer).filter(Transfer.landfill_id == landfill_id, Transfer.landfill_arrival_time >= ts, Transfer.landfill_arrival_time < ts + 86400).count()
                    else:
                        print("No landfill_id")
                        transfer_count = db.query(Transfer).filter(Transfer.landfill_arrival_time >= ts, Transfer.landfill_arrival_time < ts + 86400).count()
                    transfer_response.append({
                        "date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"),
                        "count": transfer_count
                    })
                return JSONResponse(status_code=200, content=transfer_response)
            
            else:
                return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

# Total waste transfer by STS - per day - 7 days
# Access: Admin, STS Manager ( only for their sts)
@router.get("/total_waste_transfer_by_sts")
def get_total_waste_transfer_by_sts( sts_id: int = Query(None), user: User = Depends(get_user_from_session)):
        
        if "report_total_waste_transfer_by_sts" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        with SessionLocal() as db:
            
            if user["role"]["id"] in [1, 2]:
                today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp())
                last_7_days_timestamp = []
                last_7_days_timestamp.append(today_starts_timestamp)
                for i in range(1, 8):
                    last_7_days_timestamp.append(today_starts_timestamp - (i * 86400))

                transfer_response = []
                for ts in last_7_days_timestamp:
                    transfer_count = -1

                    if user["role"]["id"] == 2:
                        sts_manager = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
                        if sts_manager is None:
                            return JSONResponse(status_code=404, content={"message": "STS not found"})
                        sts = db.query(STS).filter(STS.id == sts_manager.sts_id).first()
                        if sts is None:
                            return JSONResponse(status_code=404, content={"message": "STS not found"})
                        transfer_count = db.query(Transfer).filter(Transfer.sts_id == sts.id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()

                    elif sts_id is not None:
                        sts = db.query(STS).filter(STS.id == sts_id).first()
                        if sts is None:
                            return JSONResponse(status_code=400, content={"message": "STS not found"})
                        transfer_count = db.query(Transfer).filter(Transfer.sts_id == sts_id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()

                    else:
                        transfer_count = db.query(Transfer).filter(Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                    transfer_response.append({
                        "date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"),
                        "count": transfer_count
                    })
                return JSONResponse(status_code=200, content=transfer_response)
    
# Total oil consumption by STS - per day - 7 days
# Access: Admin, STS Manager ( only for their sts)
@router.get("/total_oil_consumption_by_sts")
def get_total_oil_consumption_by_sts( sts_id: int = Query(None), user: User = Depends(get_user_from_session)):
        
        if "report_total_oil_consumption_by_sts" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
        
        with SessionLocal() as db:
            
            if user["role"]["id"] in [1, 2]: # Admin, STS Manager
                today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp())
                last_7_days_timestamp = []
                last_7_days_timestamp.append(today_starts_timestamp)
                for i in range(1, 8):
                    last_7_days_timestamp.append(today_starts_timestamp - (i * 86400))

                oil_response = []
                for ts in last_7_days_timestamp:
                    oil_consumption = -1

                    if user["role"]["id"] == 2:
                        sts_manager = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
                        if sts_manager is None:
                            return JSONResponse(status_code=404, content={"message": "STS not found"})
                        sts = db.query(STS).filter(STS.id == sts_manager.sts_id).first()
                        if sts is None:
                            return JSONResponse(status_code=404, content={"message": "STS not found"})
                        oil_record = db.query(Transfer).filter(Transfer.sts_id == sts.id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).all()

                    elif sts_id is not None:
                        sts = db.query(STS).filter(STS.id == sts_id).first()
                        if sts is None:
                            return JSONResponse(status_code=400, content={"message": "STS not found"})
                        oil_record = db.query(Transfer).filter(Transfer.sts_id == sts_id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).all()

                    else:
                        oil_record = db.query(Transfer).filter(Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).all()
                        print(oil_record)
                    
                    # Sum oil consumption
                    oil_consumption = 0
                    for record in oil_record:
                        oil_consumption += record.oil
                    oil_response.append({
                        "date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"),
                        "oil_consumption": oil_consumption
                    })
                return JSONResponse(status_code=200, content=oil_response)

            else:
                return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
            

# Total transfer - per day - 7 days
# Access: Admin, STS Manager, Landfill Manager
@router.get("/total_transfer")
def get_total_transfer(sts_id:int = Query(None), landfill_id:int = Query(None), user: User = Depends(get_user_from_session)):
            
        if "report_total_transfer" not in user["role"]["permissions"]:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})

        with SessionLocal() as db:
            # check if sts_id and landfill_id are both valid if provided
            if sts_id is not None:
                sts = db.query(STS).filter(STS.id == sts_id).first()
                if sts is None:
                    return JSONResponse(status_code=400, content={"message": "STS not found"})
                
            if landfill_id is not None:
                landfill = db.query(Landfill).filter(Landfill.id == landfill_id).first()
                if landfill is None:
                    return JSONResponse(status_code=400, content={"message": "Landfill not found"})
                
            today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp())
            last_7_days_timestamp = []
            last_7_days_timestamp.append(today_starts_timestamp)
            for i in range(1, 8):
                last_7_days_timestamp.append(today_starts_timestamp - (i * 86400))
            
            transfer_response = []
            for ts in last_7_days_timestamp:
                transfer_count = -1

                if user["role"]["id"] == 1: # Admin

                    if sts_id is not None and landfill_id is not None:
                        transfer_count = db.query(Transfer).filter(Transfer.sts_id == sts_id, Transfer.landfill_id == landfill_id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                    elif sts_id is not None:
                        transfer_count = db.query(Transfer).filter(Transfer.sts_id == sts_id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                    elif landfill_id is not None:
                        transfer_count = db.query(Transfer).filter(Transfer.landfill_id == landfill_id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                    else:
                        transfer_count = db.query(Transfer).filter(Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()

                elif user["role"]["id"] == 2: # STS Manager
                    sts_manager = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
                    if sts_manager is None:
                        return JSONResponse(status_code=404, content={"message": "STS not found"})
                    sts = db.query(STS).filter(STS.id == sts_manager.sts_id).first()
                    if sts is None:
                        return JSONResponse(status_code=404, content={"message": "STS not found"})
                    transfer_count = db.query(Transfer).filter(Transfer.sts_id == sts.id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                
                elif user["role"]["id"] == 3: # Landfill Manager
                    landfill_manager = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).first()
                    if landfill_manager is None:
                        return JSONResponse(status_code=404, content={"message": "Landfill not found"})
                    landfill = db.query(Landfill).filter(Landfill.id == landfill_manager.landfill_id).first()
                    if landfill is None:
                        return JSONResponse(status_code=404, content={"message": "Landfill not found"})
                    transfer_count = db.query(Transfer).filter(Transfer.landfill_id == landfill.id, Transfer.sts_arrival_time >= ts, Transfer.sts_arrival_time < ts + 86400).count()
                
                transfer_response.append({
                    "date": datetime.fromtimestamp(ts).strftime("%Y-%m-%d"),
                    "count": transfer_count
                })
            return JSONResponse(status_code=200, content=transfer_response)
        

            
# Historical
# Filters
    # 1. STS - for systemadmin
    # 2. Landfill - for systemadmin
    # 3. Date range

# 5. Total waste transfer by Landfill - per day - 7 days
# 6. Total waste transfer by STS - per day - 7 days
    
# 7. Total oil consumption by STS - per day - 7 days
# 8. Toral transfer - per day - 7 days

