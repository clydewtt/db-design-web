# routes/artwork.py
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from models import Artwork, ArtworkLike, Favorite
import shutil, os
from uuid import uuid4
from database import get_db, upload_file_to_s3
from colorthief import ColorThief
from fastapi.responses import JSONResponse
import json

router = APIRouter()

UPLOAD_DIR = "static/uploads"


@router.post("/upload")
async def upload_artwork(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    user_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save image to disk (or cloud, e.g., S3)
    file_ext = os.path.splitext(image.filename)[1]
    unique_name = f"{uuid4().hex}{file_ext}"
    image_path = f"static/uploads/{unique_name}"

    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Rewind file stream before S3 upload
    image.file.seek(0)

    image_url = upload_file_to_s3(image.file, image.filename, image.content_type)

    color_thief = ColorThief(image_path)
    palette = color_thief.get_palette(color_count=3)
    hex_colors = ['#%02x%02x%02x' % rgb for rgb in palette]

    new_art = Artwork(
        artist_id=user_id,
        title=title,
        description=description,
        image_url=image_url,  # Save relative or full URL
        gradient_colors=json.dumps(hex_colors)
    )

    db.add(new_art)
    db.commit()
    db.refresh(new_art)

    return {"message": "Artwork uploaded", "artwork_id": new_art.artwork_id}


@router.get("/all")
def get_all_artworks(user_id: int = Query(...), db: Session = Depends(get_db)):
    artworks = db.query(Artwork).all()
    response = []

    for art in artworks:
        like_count = db.query(ArtworkLike).filter_by(artwork_id=art.artwork_id).count() or 0
        liked = db.query(ArtworkLike).filter_by(artwork_id=art.artwork_id, user_id=user_id).first() is not None
        favorited = db.query(Favorite).filter_by(artwork_id=art.artwork_id, user_id=user_id).first() is not None

        response.append({
            "id": art.artwork_id,
            "title": art.title,
            "username": "@" + art.artist.username if art.artist else "@unknown",
            "artist_id": art.artist_id,
            "image_url": art.image_url,
            "description": art.description,
            "gradient_colors": json.loads(art.gradient_colors) if art.gradient_colors else ["#000000", "#111111", "#222222"],
            "like_count": like_count,
            "liked": liked,
            "favorited": favorited
        })

    return JSONResponse(content=response)

@router.get("/favorites")
def get_favorited_artworks(user_id: int = Query(...), db: Session = Depends(get_db)):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .join(Artwork)
        .all()
    )

    response = []

    for fav in favorites:
        art = fav.artwork
        if not art:
            continue

        like_count = db.query(ArtworkLike).filter_by(artwork_id=art.artwork_id).count() or 0
        liked = db.query(ArtworkLike).filter_by(artwork_id=art.artwork_id, user_id=user_id).first() is not None

        response.append({
            "id": art.artwork_id,
            "title": art.title,
            "username": "@" + art.artist.username if art.artist else "@unknown",
            "artist_id": art.artist_id,
            "image_url": art.image_url,
            "description": art.description,
            "gradient_colors": json.loads(art.gradient_colors) if art.gradient_colors else ["#000000", "#111111", "#222222"],
            "like_count": like_count,
            "liked": liked,
            "favorited": True
        })

    return JSONResponse(content=response)

@router.post("/{artwork_id}/like")
def toggle_like(artwork_id: int, payload: dict = Body(...), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    existing = db.query(ArtworkLike).filter_by(artwork_id=artwork_id, user_id=user_id).first()
    if existing:
        db.delete(existing)
        action = "unliked"
    else:
        db.add(ArtworkLike(artwork_id=artwork_id, user_id=user_id))
        action = "liked"

    db.commit()
    return {"status": "ok", "action": action}

@router.post("/{artwork_id}/favorite")
def toggle_favorite(artwork_id: int, payload: dict = Body(...), db: Session = Depends(get_db)):
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id required")

    existing = db.query(Favorite).filter_by(artwork_id=artwork_id, user_id=user_id).first()
    if existing:
        db.delete(existing)
        action = "unfavorited"
    else:
        db.add(Favorite(artwork_id=artwork_id, user_id=user_id))
        action = "favorited"

    db.commit()
    return {"status": "ok", "action": action}