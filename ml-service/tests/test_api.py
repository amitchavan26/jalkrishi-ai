import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}


def test_predict_excellent_with_model():
    response = client.post("/predict", json={
        "ratio": 1.2,
        "tmax": 32.0,
        "tmin": 21.0,
        "peffDailyMm": 1.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["suitability"] == "EXCELLENT"
    assert data["source"] == "model"
    assert isinstance(data["probability"], float)


def test_predict_not_recommended_with_model():
    response = client.post("/predict", json={
        "ratio": 0.5,
        "tmax": 32.0,
        "tmin": 21.0,
        "peffDailyMm": 1.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["suitability"] == "NOT_RECOMMENDED"
    assert data["source"] == "model"
    assert isinstance(data["probability"], float)


def test_predict_falls_back_to_rules_when_model_missing(monkeypatch, tmp_path):
    nope = tmp_path / "nope.joblib"
    monkeypatch.setattr("app.main.MODEL_PATH", nope)
    response = client.post("/predict", json={
        "ratio": 0.7,
        "tmax": 32.0,
        "tmin": 21.0,
        "peffDailyMm": 1.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["suitability"] == "RISKY"
    assert data["source"] == "rules"
    assert data["probability"] == 1.0


def test_predict_invalid_input_returns_422():
    response = client.post("/predict", json={
        "ratio": "abc",
        "tmax": 32.0,
        "tmin": 21.0,
        "peffDailyMm": 1.5
    })
    assert response.status_code == 422