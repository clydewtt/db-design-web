# routes/__init__.py
from fastapi import APIRouter
from . import auth, users, artwork, comments

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(artwork.router, prefix="/artwork", tags=["artwork"])
router.include_router(comments.router, prefix="/comments", tags=["comments"])