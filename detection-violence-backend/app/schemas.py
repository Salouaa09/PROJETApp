from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserInDB(UserBase):
    id: int
    email: EmailStr
    role: Optional[str] = "user"
    
    class Config:
        from_attributes = True  # Remplace orm_mode dans Pydantic V2

class UserOut(BaseModel):
    id: int
    email: str
    role: str

    class Config:
        from_attributes = True  # Ajoutez cette ligne

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str = None