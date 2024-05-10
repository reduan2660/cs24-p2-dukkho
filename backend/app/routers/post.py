from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
from app.dependencies import get_user_from_session
from app.models import User, Post, PostLike
from app.config import SessionLocal
from datetime import datetime

router = APIRouter(
    prefix="/post",
    tags=["post"],
    responses={404: {"description": "Route not found"}},
)


class PostRequest(BaseModel):
    content: str

@router.post("/")
async def create_post(
    post: PostRequest,
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        post = Post(
            content = post.content,
            approval = 0,
            like_count = 0,
            created_by = user["id"],
            created_at = datetime.now().timestamp()

        )
        db.add(post)
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Post created successfully"})
    

@router.get("/")
async def get_posts(
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        posts = db.query(Post).all()
        response = []
        for post in posts:

            # check if i have liked the post
            like = db.query(PostLike).filter(PostLike.post_id == post.id, PostLike.user_id == user["id"]).first()
            liked = False
            if like is not None:
                liked = True
            
            response.append({
                "id": post.id,
                "content": post.content,
                "approval": post.approval,
                "like_count": post.like_count,
                "created_by": {
                    "id": post.user.id,
                    "name": post.user.name,
                    "username": post.user.username
                },
                "liked": liked,
                "created_at": post.created_at,
            })

        return JSONResponse(status_code=200, content=response)
    

@router.get("/{post_id}/like")
async def like_post(
    post_id: int,
    user: User = Depends(get_user_from_session)
):
    
    with SessionLocal() as db:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            return JSONResponse(status_code=404, content={"message": "Post not found"})
        
        like = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == user["id"]).first()
        if like is not None:
            return JSONResponse(status_code=400, content={"message": "You have already liked the post"})
        
        db.add(PostLike(
            post_id = post_id,
            user_id = user["id"]
        ))
        post.like_count += 1
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Post liked successfully"})
    

@router.get("/{post_id}/approve")
async def approve_post(
    post_id: int,
    user: User = Depends(get_user_from_session)
):
    if user["role"]["id"] != 1:
        return JSONResponse(status_code=401, content={"message": "Not enough permissions"})
    
    with SessionLocal() as db:
        post = db.query(Post).filter(Post.id == post_id).first()
        if post is None:
            return JSONResponse(status_code=404, content={"message": "Post not found"})
      
        post.approval = 1
        db.query(Post).filter(Post.id == post_id).update({
            "approval": 1
        })
        db.commit()
        return JSONResponse(status_code=200, content={"message": "Post approved successfully"})