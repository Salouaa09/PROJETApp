from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth import get_current_user
from app.models import User

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à accéder à cette ressource (admin requis)."
        )
    return current_user
