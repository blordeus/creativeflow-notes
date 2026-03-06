from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import models, schemas
from database import engine, get_db
models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="CreativeFlow Notes API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Lock down in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ─── CRUD ────────────────────────────────────────────────────────────────────
@app.get("/notes", response_model=List[schemas.NoteOut])
def get_notes(
    archived: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Note)
    if archived is not None:
        q = q.filter(models.Note.is_archived == archived)
    if search:
        like = f"%{search}%"
        q = q.filter(
            models.Note.title.ilike(like) |
            models.Note.content.ilike(like) |
            models.Note.tags.ilike(like)
        )
    if tag:
        q = q.filter(models.Note.tags.ilike(f"%{tag}%"))
    if category:
        q = q.filter(models.Note.category == category)
    return q.order_by(models.Note.is_pinned.desc(), models.Note.updated_at.desc()).all()
@app.post("/notes", response_model=schemas.NoteOut, status_code=201)
def create_note(note: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note
@app.get("/notes/{note_id}", response_model=schemas.NoteOut)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note
@app.patch("/notes/{note_id}", response_model=schemas.NoteOut)
def update_note(note_id: int, updates: schemas.NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, val in updates.model_dump(exclude_unset=True).items():
        setattr(note, field, val)
    db.commit()
    db.refresh(note)
    return note
@app.delete("/notes/{note_id}", status_code=204)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
@app.patch("/notes/{note_id}/archive", response_model=schemas.NoteOut)
def toggle_archive(note_id: int, db: Session = Depends(get_db)):
    note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note.is_archived = not note.is_archived
    db.commit()
    db.refresh(note)
    return note
@app.get("/tags")
def get_all_tags(db: Session = Depends(get_db)):
    notes = db.query(models.Note.tags).all()
    tag_set = set()
    for (tags,) in notes:
        if tags:
            for t in tags.split(","):
                t = t.strip()
                if t:
                    tag_set.add(t)
    return sorted(tag_set)
@app.get("/categories")
def get_categories():
    return ["Ideas", "Projects", "Clients", "Inspiration", "Finances", "Marketing", "General"]