from fastapi import FastAPI
from app.routers import auth, users, roles, sts, landfill, vehicle, transfer, report, contract, collectionPlan, employee, garbageCollection, employeeActivity, schedule, billing, ticket, post, event
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(sts.router)
app.include_router(landfill.router)
app.include_router(vehicle.router)
app.include_router(transfer.router)
app.include_router(report.router)
app.include_router(contract.router)
app.include_router(collectionPlan.router)
app.include_router(employee.router)
app.include_router(garbageCollection.router)
app.include_router(employeeActivity.router)
app.include_router(schedule.router)
app.include_router(billing.router)
app.include_router(ticket.router)
app.include_router(post.router)
app.include_router(event.router)

# Allow CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://dukkho.alvereduan.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Allows all origins
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

@app.get("/")
def root():
    return {"ping": "pong"}