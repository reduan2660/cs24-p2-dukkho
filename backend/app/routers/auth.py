from fastapi import APIRouter, Depends
from app.dependencies import get_token_header, get_query_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.get("/login")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]

@router.get("/logout", dependencies=[Depends(get_token_header)])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]
