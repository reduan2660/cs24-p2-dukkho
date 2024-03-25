from fastapi import Header, HTTPException
from typing_extensions import Annotated


async def get_token_header(SESSION: Annotated[str, Header()]):
    if SESSION != "fake-super-secret-token":
        raise HTTPException(status_code=400, detail="X-Token header invalid")


async def get_query_token(token: str):
    if token != "jessica":
        raise HTTPException(status_code=400, detail="No Jessica token provided")