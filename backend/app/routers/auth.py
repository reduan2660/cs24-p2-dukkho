from fastapi import APIRouter
router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.get("/login")
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]
