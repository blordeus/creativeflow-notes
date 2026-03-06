from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class NoteBase(BaseModel):
    title: str
    content: Optional[str] = ""
    tags: Optional[str] = ""
    category: Optional[str] = "General"
    color: Optional[str] = "#ffffff"
    is_pinned: Optional[bool] = False
class NoteCreate(NoteBase):
    pass
class NoteUpdate(NoteBase):
    title: Optional[str] = None
    is_archived: Optional[bool] = None
    is_pinned: Optional[bool] = None
class NoteOut(NoteBase):
    id: int
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True