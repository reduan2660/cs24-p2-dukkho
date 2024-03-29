from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import Transfer, Vehicle, STS, Landfill, User, STSmanager, LandfillManager
from app.config import SessionLocal
from datetime import datetime
from math import radians, sin, cos, sqrt, atan2
from app.utils.fleet import optimizeFleet

router = APIRouter(
    prefix="/transfer",
    tags=["transfer"],
    responses={404: {"description": "Route not found"}},
)

def get_status_desc(status_id):
    if status_id == 1:
        return "Departed from sts"
    elif status_id == 2:
        return "Arrived at landfill"
    elif status_id == 3:
        return "Departed from landfill"
    elif status_id == 4:
        return "Trip completed"
    else:
        return "Invalid Status"

@router.get("/")
async def get_transfers(user: User = Depends(get_user_from_session)):

    if "view_transfer" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        
        if user["role"]["id"] == 1: # Admin
            transfers = db.query(Transfer).all()
        elif user["role"]["id"] == 2: # STS
            sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            transfers = db.query(Transfer).filter(Transfer.sts_id == sts.sts_id).all()
        elif user["role"]["id"] == 3: # Landfill
            landfill = db.query(LandfillManager).filter(LandfillManager.user_id == user["id"]).first()
            if landfill is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            transfers = db.query(Transfer).filter(Transfer.landfill_id == landfill.landfill_id).all()

        else:
            return JSONResponse(status_code=401, content={"message": "Not enough permissions"})


        response = []
        for t in transfers:
            response.append({
                "id": t.id,
                "vehicle": {
                    "id": t.vehicle.id,
                    "reg_no": t.vehicle.reg_no,
                    "capacity": t.vehicle.capacity,
                    "vtype": t.vehicle.vtype,
                    "loaded_cost": t.vehicle.loaded_cost,
                    "empty_cost": t.vehicle.empty_cost
                },
                "sts": {
                    "id": t.sts.id,
                    "name": t.sts.name,
                    "ward_no": t.sts.ward_no,
                    "latitude": t.sts.latitude,
                    "longitude": t.sts.longitude
                },
                "landfill": {
                    "id": t.landfill.id,
                    "name": t.landfill.name,
                    "latitude": t.landfill.latitude,
                    "longitude": t.landfill.longitude,
                    "capacity": t.landfill.capacity,
                    "current_capacity": t.landfill.current_capacity
                },

                "sts_departure_time": t.sts_departure_time,
                "sts_departure_weight": t.sts_departure_weight,
                "oil": t.oil,
                "landfill_arrival_time": t.landfill_arrival_time,
                "landfill_arrival_weight": t.landfill_arrival_weight,
                "landfill_departure_time": t.landfill_departure_time,
                "sts_arrival_time": t.sts_arrival_time,
                "status": {
                    "id": t.status,
                    "desc": get_status_desc(t.status)
                }
                
            })

        return JSONResponse(status_code=200, content=response)


class STSdeparture(BaseModel):
    vehicle_id: int
    landfill_id: int
    weight: float
    oil: float

@router.post("/sts/departure")
async def sts_departure(transfer: STSdeparture, user: User = Depends(get_user_from_session)):
    if "update_transfer_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    if user["role"]["id"] != 2: # STS
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user_sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
        if user_sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        sts = db.query(STS).filter(STS.id == user_sts.sts_id).first()
        if sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == transfer.vehicle_id).first()
        if vehicle is None:
            return JSONResponse(status_code=404, content={"message": "Vehicle not found"})
        
        # TODO: check for vehicle availability
        
        landfill = db.query(Landfill).filter(Landfill.id == transfer.landfill_id).first()
        if landfill is None:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        # check if landfil has capacity
        if landfill.current_capacity < transfer.weight:
            return JSONResponse(status_code=400, content={"message": "Not enough capacity for landfill."})
        
        newTransfer = Transfer(
            sts_id=user_sts.sts_id,
            vehicle_id=transfer.vehicle_id,
            landfill_id=transfer.landfill_id,
            sts_departure_time=int(datetime.now().timestamp()),
            sts_departure_weight=transfer.weight,
            oil=transfer.oil,
            status=1 # Departed from sts
        )
        db.add(newTransfer)

        # Update vehicle availability
        vehicle.available = 0

        # Update landfil capacity
        landfill.current_capacity = landfill.current_capacity - transfer.weight
        
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Transfer added successfully"})
    



class LandfillArrival(BaseModel):
    weight: float

@router.patch("/landfill/arrival/{transfer_id}")
async def landfill_arrival(transfer_id: int, arrival: LandfillArrival, user: User = Depends(get_user_from_session)):
    if "update_transfer_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 1: # Must progress from "STS Departure"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.landfill_arrival_time = int(datetime.now().timestamp())
        transfer.landfill_arrival_weight = arrival.weight
        transfer.status = 2 # Arrived at landfill
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})

@router.patch("/landfill/departure/{transfer_id}")
async def landfill_departure(transfer_id: int, user: User = Depends(get_user_from_session)):
    if "update_transfer_landfill" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 2: # Must progress from "Landfill arrival"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.landfill_departure_time = int(datetime.now().timestamp())
        transfer.status = 3 # Departed from landfill
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})
    
@router.patch("/sts/arrival/{transfer_id}")
async def sts_arrival(transfer_id: int, user: User = Depends(get_user_from_session)):
    if "update_transfer_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if transfer is None:
            return JSONResponse(status_code=404, content={"message": "Transfer not found"})
        elif transfer.status != 3: # Must progress from "Landfill departure"
            return JSONResponse(status_code=404, content={"message": "Invalid progression"})
        
        transfer.sts_arrival_time = int(datetime.now().timestamp())
        transfer.status = 4 # Trip completed

        # Update vehicle availability
        vehicle = db.query(Vehicle).filter(Vehicle.id == transfer.vehicle_id).first()
        vehicle.available = 1
        db.commit()

        return JSONResponse(status_code=200, content={"message": "Transfer updated successfully"})


def haversine_distance(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    radius = 6371  
    distance = radius * c
    return distance

class OILrequest(BaseModel):
    vehicle_id: int
    landfill_id: int
    weight: float

@router.post("/oil")
async def sts_oil(transfer: OILrequest, user: User = Depends(get_user_from_session)):
    if "update_transfer_sts" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    if user["role"]["id"] != 2: # STS
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        user_sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
        if user_sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        sts = db.query(STS).filter(STS.id == user_sts.sts_id).first()
        if sts is None:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        vehicle = db.query(Vehicle).filter(Vehicle.id == transfer.vehicle_id).first()
        if vehicle is None:
            return JSONResponse(status_code=404, content={"message": "Vehicle not found"})
        
        # TODO: check for vehicle availability
        
        landfill = db.query(Landfill).filter(Landfill.id == transfer.landfill_id).first()
        if landfill is None:
            return JSONResponse(status_code=404, content={"message": "Landfill not found"})
        
        lat1 = landfill.latitude
        lon1 = landfill.longitude
        lat2 = sts.latitude
        lon2 = sts.longitude
        distance = haversine_distance(lat1, lon1, lat2, lon2)

        
        # cost calculation
        ratio=transfer.weight/vehicle.capacity
        cost_journey = vehicle.empty_cost + ratio*(vehicle.loaded_cost-vehicle.empty_cost)
        
        to_landfill=distance*cost_journey
        from_landfill = distance*vehicle.empty_cost
        total_bill = to_landfill + from_landfill

        return JSONResponse(status_code=200, content={
            "to_landfill": to_landfill,
            "from_landfill": from_landfill,
            "round_trip": total_bill,
            "distance": distance
            })



class FleetRequest(BaseModel):
    weight: float

@router.post("/fleet")
async def get_fleet( fleetRequest: FleetRequest, sts_id : int = Query(None), user: User = Depends(get_user_from_session)):
    if "get_fleet_planning" not in user["role"]["permissions"]:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:

        if user["role"]["id"] == 2: # STS

            user_sts = db.query(STSmanager).filter(STSmanager.user_id == user["id"]).first()
            if user_sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
            
            sts = db.query(STS).filter(STS.id == user_sts.sts_id).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})

            sts_id = sts.id
        elif sts_id is not None:
            sts = db.query(STS).filter(STS.id == sts_id).first()
            if sts is None:
                return JSONResponse(status_code=404, content={"message": "STS not found"})
        else:
            return JSONResponse(status_code=404, content={"message": "STS not found"})
        
        weight = fleetRequest.weight

        sts_vehicle = db.query(Vehicle).filter(Vehicle.sts_id == sts_id).all()
        no_of_vehicles = 0

        costs_unloaded = []
        costs_loaded = []
        vehicle_capacities = []
        vehicle_remaining_trips = []
        Vehicle_id=[]
        for v in sts_vehicle:

            if v.available==0:
                continue
            
            no_of_vehicles += 1

            costs_unloaded.append(v.empty_cost)
            costs_loaded.append(v.loaded_cost)
            vehicle_capacities.append(v.capacity)
            Vehicle_id.append(v.id)

            # count the number of transfers of this vehicle today
            today_starts_timestamp = int(datetime.combine(datetime.today(), datetime.min.time()).timestamp()) # Get today's start timestamp
            transfer_count = db.query(Transfer).filter(Transfer.vehicle_id == v.id).filter(Transfer.sts_departure_time >= today_starts_timestamp).count()
            if transfer_count>3:
                print("Excessive Transfer Error")
            vehicle_remaining_trips.append(3 - transfer_count)

        all_landfill = db.query(Landfill).all()

        # sort by ascending order of distance from sts
        all_landfill.sort(key=lambda x: haversine_distance(sts.latitude, sts.longitude, x.latitude, x.longitude))        
        no_of_landfills = len(all_landfill)

        landfill_capacities = []
        landfill_capacitites_csum = []
        landfill_distances = []
        landfill_ids=[]

        for landfill in all_landfill:
            landfill_capacities.append(landfill.capacity)
            landfill_distances.append(haversine_distance(sts.latitude, sts.longitude, landfill.latitude, landfill.longitude))
            landfill_ids.append(landfill.id)
            landfill_capacitites_csum.append(sum(landfill_capacities))

        max_pos_weight, cost, number_of_transfers, transfers = optimizeFleet(sts, weight, costs_unloaded, costs_loaded, vehicle_capacities, vehicle_remaining_trips, no_of_vehicles, landfill_capacities, landfill_distances, no_of_landfills, landfill_capacitites_csum, landfill_ids,Vehicle_id)


        transfer_response = []
        for i in range(len(transfers)):

            transfer_response.append({
                "vehicle": {
                    "id": transfers[i][0],
                    "reg_no": db.query(Vehicle).filter(Vehicle.id == transfers[i][0]).first().reg_no
                },
                "weight": transfers[i][1],
                "landfill": {
                    "id": transfers[i][2],
                    "name": db.query(Landfill).filter(Landfill.id == transfers[i][2]).first().name
                },
                 "cost": transfers[i][3]
            })
            

        return JSONResponse(status_code=200, content={
            "max_possible_weight": max_pos_weight,
            "cost": cost,
            "number_of_transfers": number_of_transfers,
            "transfers": transfer_response
            })