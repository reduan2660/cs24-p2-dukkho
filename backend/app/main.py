from fastapi import FastAPI
from app.routers import auth, users, roles
app = FastAPI()

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)

@app.get("/")
def root():
    return {"ping": "pong"}