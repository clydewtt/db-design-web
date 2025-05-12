from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:root@localhost:8889/ArtDB"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


#### AWS S3 BUCKET ####

import boto3
from uuid import uuid4
from dotenv import load_dotenv
import os

load_dotenv()

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
)

BUCKET = os.getenv("AWS_S3_BUCKET")

def upload_file_to_s3(file_obj, filename, content_type):
    key = f"artworks/{uuid4().hex}_{filename}"
    s3.upload_fileobj(
        Fileobj=file_obj,
        Bucket=BUCKET,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )
    return f"https://{BUCKET}.s3.amazonaws.com/{key}"
