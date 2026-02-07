# src/api/alerts.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Alert(BaseModel):
    id: int
    dateTime: str
    cameraName: str
    violenceType: str
    confidenceScore: int




alerts_db: List[Alert] = []

@app.post("/send_alert_email")
async def send_alert_email(alert: Alert):
    # ici tu envoies l'email (code que je t'ai donné avant)
    # et en plus tu ajoutes dans la "base temporaire"
    alerts_db.append(alert)
    return {"message": "Email envoyé et alerte enregistrée ✅"}

@app.get("/alerts")
async def get_alerts():
    return alerts_db
