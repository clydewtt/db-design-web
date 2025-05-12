from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'Users'
    
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String(255), nullable=False)

    # Relationships
    artworks = relationship('Artwork', back_populates='artist')
    favorites = relationship('Favorite', back_populates='user')
    comments = relationship("Comment", back_populates="user")


class Artwork(Base):
    __tablename__ = 'Artwork'
    
    artwork_id = Column(Integer, primary_key=True, autoincrement=True)
    artist_id = Column(Integer, ForeignKey('Users.user_id'))
    title = Column(String(255))
    description = Column(Text)
    image_url = Column(String(255))
    gradient_colors = Column(Text)

    # Relationships
    artist = relationship('User', back_populates='artworks')
    favorited_by = relationship('Favorite', back_populates='artwork')
    comments = relationship("Comment", back_populates="artwork")


class ArtworkLike(Base):
    __tablename__ = "ArtworkLikes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    artwork_id = Column(Integer, ForeignKey("Artwork.artwork_id"))
    user_id = Column(Integer, ForeignKey("Users.user_id"))

    __table_args__ = (UniqueConstraint("artwork_id", "user_id", name="_artwork_like_uc"),)

    user = relationship("User")
    artwork = relationship("Artwork")

class Favorite(Base):
    __tablename__ = 'Favorites'
    
    favorite_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('Users.user_id'))
    artwork_id = Column(Integer, ForeignKey('Artwork.artwork_id'))

    # Relationships
    user = relationship('User', back_populates='favorites')
    artwork = relationship('Artwork', back_populates='favorited_by')

class Comment(Base):
    __tablename__ = 'Comments'

    comment_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('Users.user_id'), nullable=False)
    artwork_id = Column(Integer, ForeignKey('Artwork.artwork_id'), nullable=False)
    comment_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now())

    # Optional relationships
    user = relationship("User", back_populates="comments")
    artwork = relationship("Artwork", back_populates="comments")

class CommentLike(Base):
    __tablename__ = "CommentLikes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    comment_id = Column(Integer, ForeignKey("Comments.comment_id"), nullable=False)
    user_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)

    # Ensure a user can only like a comment once
    __table_args__ = (UniqueConstraint("comment_id", "user_id", name="_user_comment_uc"),)
