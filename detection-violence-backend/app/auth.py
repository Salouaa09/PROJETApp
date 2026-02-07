# Logique d'authentification
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from .database import SessionLocal
from . import crud
from .utils import get_password_hash, verify_password  # Importer depuis utils
# Fonction pour récupérer l'utilisateur courant
from . import schemas  # Assure-toi que schemas.UserInDB est bien défini

# Configuration (à mettre dans un fichier .env en production!)
SECRET_KEY = "votre_cle_secrete_complexe"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuration du hashage des mots de passe
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Fonctions de hashage
def get_password_hash(password: str) -> str:
    """Hash un mot de passe avec bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si un mot de passe correspond à son hash"""
    return pwd_context.verify(plain_password, hashed_password)

# Fonction d'authentification
def authenticate_user(db, email: str, password: str):
    """Authentifie un utilisateur avec email et mot de passe"""
    user = crud.get_user_by_email(db, email)
    
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

# Fonction de création de token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crée un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Fonction pour récupérer l'utilisateur courant et le retourner sous forme de schéma Pydantic
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Connexion à la base
    db = SessionLocal()
    user = crud.get_user_by_email(db, email)
    db.close()

    if user is None:
        raise credentials_exception

    # ✅ On retourne un objet compatible avec schemas.UserInDB
    return schemas.UserInDB(
        id=user.id,
        email=user.email,
        role=user.role,
    )