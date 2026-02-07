from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, crud
from app.database import get_db
from app.auth import get_current_user
from typing import List
from app.models import User
from app.schemas import UserOut
router = APIRouter(prefix="/admin", tags=["admin"])

# Dépendance pour vérifier que l'utilisateur est admin
def require_admin(user: models.User = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return user

@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(require_admin)
):
    users = crud.get_all_users(db)
    return [schemas.UserOut.from_orm(user) for user in users]

@router.get("/users/me", response_model=UserOut)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/users", response_model=schemas.UserOut)
def create_user(
    user_data: schemas.UserCreate,  # ou le schéma que tu utilises pour créer un user
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    existing_user = crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400, detail="Un utilisateur avec cet email existe déjà"
        )
    new_user = crud.create_user(db, user_data)
    return schemas.UserOut.from_orm(new_user)

from fastapi import Path

@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int = Path(..., title="L'ID de l'utilisateur à supprimer"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    crud.delete_user(db, user_id)
    return
