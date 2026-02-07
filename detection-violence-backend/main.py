# main.py
import os
import shutil
import uuid
import cv2
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import engine, get_db
from models.two_stream_inference import predict_two_stream
from models.i3d_inference      import predict_i3d
from models.cnn_lstm_inference import predict_cnn_lstm
from app import models, schemas, auth, crud
from app.auth import authenticate_user, create_access_token
from fastapi.security import OAuth2PasswordRequestForm
from app.routes import admin

app = FastAPI()

# Répertoires
TEMP_DIR = "temp_videos"
ANNOTATED_DIR = "annotated_videos"
os.makedirs(TEMP_DIR, exist_ok=True)
os.makedirs(ANNOTATED_DIR, exist_ok=True)

# Endpoint pour servir les vidéos annotées avec téléchargement
@app.get("/annotated/{filename}")
async def get_annotated_video(filename: str):
    file_path = os.path.join(ANNOTATED_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=filename
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


@app.post("/predict")
async def predict_violence(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    model: str       = Form(...)
):
    # Génération d’un nom temporaire unique
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    tmp_name = f"{uuid.uuid4().hex}{ext}"
    tmp_path = os.path.join(TEMP_DIR, tmp_name)

    with open(tmp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Appel du bon modèle selon sélection
        if model == "i3d_two_streams":
            dur = get_video_duration(tmp_path)
            resp = predict_two_stream(tmp_path, full_video=(dur < 10))
        elif model == "i3d":
            resp = predict_i3d(tmp_path)
        elif model == "cnn_lstm":
            resp = predict_cnn_lstm(tmp_path)
        else:
            raise HTTPException(status_code=400, detail="Modèle non supporté")

        return resp

    except HTTPException:
        raise

    except Exception as e:
        tb = traceback.format_exc()
        print("Erreur pendant /predict :", tb)
        raise HTTPException(
            status_code=500,
            detail={"error": str(e), "traceback": tb}
        )

    finally:
        try:
            file.file.close()
        except:
            pass
        background_tasks.add_task(os.remove, tmp_path)


def get_video_duration(path: str) -> float:
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return 0.0
    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    frames = cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0.0
    cap.release()
    return frames / fps if fps > 0 else 0.0


@app.get("/")
async def root():
    return {"message": "Bienvenue dans votre système de détection de violence"}


@app.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/users/me/", response_model=schemas.UserInDB)
async def read_users_me(current_user: schemas.UserInDB = Depends(auth.get_current_user)):
    return current_user


@app.get("/api/protected", response_model=schemas.UserInDB)
async def protected_route(current_user: schemas.UserInDB = Depends(auth.get_current_user)):
    return current_user


app.include_router(admin.router)
