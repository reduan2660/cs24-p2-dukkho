from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Event, EventFollower
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/event",
    tags=["event"],
    responses={404: {"description": "Route not found"}},
)

class EventRequest(BaseModel):
    name: str
    description: str = None
    location: str = None
    start_time: int = None
    end_time: int = None

@router.post("/")
async def create_event(
    event: EventRequest,
    user: User = Depends(get_user_from_session)
):
    if user["role"]["id"] != 1:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        event = Event(
            name = event.name,
            description = event.description,
            location = event.location,
            start_time = event.start_time,
            end_time = event.end_time,
            created_at = datetime.now().timestamp()

        )
        db.add(event)
        db.commit()
        return JSONResponse(status_code=201, content={"message": "Event created successfully"})

@router.get("/")
async def get_events(
    user: User = Depends(get_user_from_session)
):
    with SessionLocal() as db:
        events = db.query(Event).all()
        response = []
        for event in events:

            # check if user follows the event
            follow = db.query(EventFollower).filter(EventFollower.event_id == event.id, EventFollower.user_id == user["id"]).first()
            followed = False
            if follow is not None:
                followed = True

            response.append({
                "id": event.id,
                "name": event.name,
                "description": event.description,
                "location": event.location,
                "start_time": event.start_time,
                "end_time": event.end_time,
                "created_at": event.created_at,
                "followed": followed
            })

        return JSONResponse(status_code=200, content=response)
    
@router.get("/{event_id}/follow")
async def follow_event(
    event_id: int,
    user: User = Depends(get_user_from_session)
):
    with SessionLocal() as db:
        follow = db.query(EventFollower).filter(EventFollower.event_id == event_id, EventFollower.user_id == user["id"]).first()
        if follow is not None:
            return JSONResponse(status_code=400, content={"message": "Already following the event"})
        
        db.add(EventFollower(
            event_id = event_id,
            user_id = user["id"]
        ))
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Event followed successfully"})

