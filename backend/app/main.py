from fastapi import FastAPI
from app.routers import auth, users, roles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)

# Allow CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
def root():
    return {"ping": "pong"}