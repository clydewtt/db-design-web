from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from models import Comment, CommentLike, Artwork, User
from database import get_db
from pydantic import BaseModel

router = APIRouter()

class CommentCreate(BaseModel):
    artwork_id: int
    user_id: int
    text: str

class CommentUpdate(BaseModel):
    user_id: int
    text: str

@router.post("/")
def post_comment(comment: CommentCreate, db: Session = Depends(get_db)):
    # Optionally validate user/artwork exists
    new_comment = Comment(
        user_id=comment.user_id,
        artwork_id=comment.artwork_id,
        comment_text=comment.text
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return {"message": "Comment posted"}

@router.get("/{artwork_id}")
def get_comments(artwork_id: int, user_id: int, db: Session = Depends(get_db)):
    artwork = db.query(Artwork).filter_by(artwork_id=artwork_id).first()
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")

    comments = (
        db.query(Comment)
        .options(joinedload(Comment.user))
        .filter(Comment.artwork_id == artwork_id)
        .order_by(Comment.timestamp.asc())
        .all()
    )
    
    response = []
    for c in comments:
        liked = db.query(CommentLike).filter_by(comment_id=c.comment_id, user_id=user_id).first()
        like_count = db.query(CommentLike).filter_by(comment_id=c.comment_id).count()

        response.append({
            "id": c.comment_id,
            "text": c.comment_text,
            "user": "@" + c.user.username,
            "user_id": c.user_id,
            "liked": liked is not None,
            "like_count": like_count,
            "is_author": c.user_id == artwork.artist_id,
        })

    return response

@router.post("/{comment_id}/like", status_code=status.HTTP_204_NO_CONTENT)
def toggle_comment_like(comment_id: int, user_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter_by(comment_id=comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    existing_like = db.query(CommentLike).filter_by(comment_id=comment_id, user_id=user_id).first()

    if existing_like:
        db.delete(existing_like)
    else:
        new_like = CommentLike(comment_id=comment_id, user_id=user_id)
        db.add(new_like)

    db.commit()
    return


@router.delete("/{comment_id}")
def delete_comment(comment_id: int, user_id: int, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter_by(comment_id=comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="You can't delete this comment")

    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}

@router.put("/{comment_id}")
def update_comment(comment_id: int, update: CommentUpdate, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter_by(comment_id=comment_id).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != update.user_id:
        raise HTTPException(status_code=403, detail="You can't edit this comment")

    comment.comment_text = update.text
    db.commit()
    db.refresh(comment)

    return {"message": "Comment updated"}