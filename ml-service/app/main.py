from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

MODEL_PATH = Path(__file__).resolve().parent.parent / "model.joblib"


def load_model():
    if not MODEL_PATH.exists():
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception:
        return None


class PredictRequest(BaseModel):
    ratio: float
    tmax: float
    tmin: float
    peffDailyMm: float


def rule_label_for(ratio: float) -> str:

    if ratio >= 1.0:
        return "EXCELLENT"
    elif ratio >= 0.8:
        return "GOOD"
    elif ratio >= 0.6:
        return "RISKY"
    else:
        return "NOT_RECOMMENDED"


@app.get("/health")
def health():
    return {"status": "UP"}


@app.post("/predict")
def predict(req: PredictRequest):
    model = load_model()
    if model is not None:
        X = pd.DataFrame([{
            "ratio": req.ratio,
            "tmax": req.tmax,
            "tmin": req.tmin,
            "peffDailyMm": req.peffDailyMm
        }])
        pred = model.predict(X)[0]
        proba = model.predict_proba(X)
        max_prob = float(proba.max())
        return {
            "suitability": str(pred),
            "probability": round(max_prob, 4),
            "source": "model"
        }
    else:
        suitability = rule_label_for(req.ratio)
        return {
            "suitability": suitability,
            "probability": 1.0,
            "source": "rules"
        }
