from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from typing import List
import uuid
import os
import zipfile
import shutil

DATABASE_URL = "sqlite:///./hrr.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class HandoffSession(Base):
    __tablename__ = "handoff_sessions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    source = Column(String, default="naukri")
    status = Column(String, default="awaiting_resumes")
    created_at = Column(DateTime, default=datetime.utcnow)
    resumes = relationship("Resume", back_populates="handoff")

class Resume(Base):
    __tablename__ = "resumes"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    handoff_id = Column(String, ForeignKey("handoff_sessions.id"), nullable=False)
    job_id = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    handoff = relationship("HandoffSession", back_populates="resumes")

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/handoff/start")
def start_handoff(job_id: str = Form(...), user_id: str = Form(...)):
    db = next(get_db())
    handoff = HandoffSession(job_id=job_id, user_id=user_id)
    db.add(handoff)
    db.commit()
    db.refresh(handoff)
    return {"handoff_id": handoff.id, "status": handoff.status}

def save_resume(db, handoff_id: str, job_id: str, file: UploadFile):
    file_ext = os.path.splitext(file.filename)[1].lower()
    file_id = str(uuid.uuid4())
    storage_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(storage_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    resume = Resume(
        handoff_id=handoff_id,
        job_id=job_id,
        file_name=file.filename,
        file_type=file_ext.replace(".", ""),
        storage_path=storage_path
    )
    db.add(resume)
    return resume

def process_zip(db, handoff_id: str, job_id: str, zip_path: str):
    extract_dir = os.path.join(UPLOAD_DIR, str(uuid.uuid4()))
    os.makedirs(extract_dir, exist_ok=True)
    resumes = []
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    for root, dirs, files in os.walk(extract_dir):
        for file_name in files:
            ext = os.path.splitext(file_name)[1].lower()
            if ext in [".pdf", ".docx"]:
                file_path = os.path.join(root, file_name)
                new_id = str(uuid.uuid4())
                new_path = os.path.join(UPLOAD_DIR, f"{new_id}{ext}")
                shutil.move(file_path, new_path)
                resume = Resume(
                    handoff_id=handoff_id,
                    job_id=job_id,
                    file_name=file_name,
                    file_type=ext.replace(".", ""),
                    storage_path=new_path
                )
                db.add(resume)
                resumes.append(resume)
    shutil.rmtree(extract_dir)
    return resumes

@app.post("/resumes/upload")
def upload_resumes(
    handoff_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    db = next(get_db())
    handoff = db.query(HandoffSession).filter(HandoffSession.id == handoff_id).first()
    if not handoff:
        raise HTTPException(status_code=404, detail="Handoff session not found")
    uploaded = []
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext == ".zip":
            temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.zip")
            with open(temp_path, "wb") as f:
                shutil.copyfileobj(file.file, f)
            resumes = process_zip(db, handoff_id, handoff.job_id, temp_path)
            os.remove(temp_path)
            uploaded.extend([{"id": r.id, "file_name": r.file_name} for r in resumes])
        elif ext in [".pdf", ".docx"]:
            resume = save_resume(db, handoff_id, handoff.job_id, file)
            uploaded.append({"id": resume.id, "file_name": resume.file_name})
    handoff.status = "resumes_received"
    db.commit()
    return {"uploaded": uploaded, "count": len(uploaded)}

@app.post("/resumes/email")
def email_ingestion(
    handoff_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    return upload_resumes(handoff_id=handoff_id, files=files)
