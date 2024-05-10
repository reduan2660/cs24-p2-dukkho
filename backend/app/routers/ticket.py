from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Ticket
from app.config import SessionLocal
from datetime import datetime


router = APIRouter(
    prefix="/ticket",
    tags=["ticket"],
    responses={404: {"description": "Route not found"}},
)

class TicketRequest(BaseModel):
    location: str
    category: str
    description: str
    anonymous: int

@router.post("/")
async def create_ticket(
    ticket: TicketRequest,
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        ticket = Ticket(
            location = ticket.location,
            category = ticket.category,
            description = ticket.description,
            anonymous = ticket.anonymous,
            created_by = user["id"],
            created_at = datetime.now().timestamp()

        )
        db.add(ticket)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Ticket created successfully"})
    

@router.get("/")
async def get_tickets(
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        tickets = db.query(Ticket).all()
        response = []
        for ticket in tickets:
            response.append({
                "id": ticket.id,
                "location": ticket.location,
                "category": ticket.category,
                "description": ticket.description,
                "anonymous": ticket.anonymous,
                "created_by": "Anonymous" if ticket.anonymous == 1 else ticket.user.name,
                "created_at": ticket.created_at,
                "reply": ticket.reply
            })
        return JSONResponse(status_code=200, content=response)
    
@router.get("/my")
async def get_my_tickets(
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        tickets = db.query(Ticket).filter(Ticket.created_by == user["id"]).order_by(Ticket.id.desc()).all()
        response = []
        for ticket in tickets:
            response.append({
                "id": ticket.id,
                "location": ticket.location,
                "category": ticket.category,
                "description": ticket.description,
                "anonymous": ticket.anonymous,
                "created_at": ticket.created_at,
                "reply": ticket.reply
            })
        return JSONResponse(status_code=200, content=response)
    

class TicketUpdateRequest(BaseModel):
    reply: str

@router.patch("/{ticket_id}")
async def update_ticket(
    ticket_id: int,
    ticketReq: TicketUpdateRequest,
    user: User = Depends(get_user_from_session)
):
    
    if user["role"]["id"] != 1: # Super Admin
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        if ticket is None:
            return JSONResponse(status_code=404, content={"message": "Ticket not found"})
        
        db.query(Ticket).filter(Ticket.id == ticket_id).update({
            "reply": ticketReq.reply
        })
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Ticket updated successfully"})