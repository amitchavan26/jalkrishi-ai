import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


CLASSES = ["EXCELLENT", "GOOD", "RISKY", "NOT_RECOMMENDED"]


def label_for(ratio: float) -> str:
    if ratio >= 1.0:
        return "EXCELLENT"
    elif ratio >= 0.8:
        return "GOOD"
    elif ratio >= 0.6:
        return "RISKY"
    else:
        return "NOT_RECOMMENDED"


def generate_dataset(n: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    
    ratio = rng.uniform(0.2, 1.8, n)
    tmin = rng.uniform(12, 26, n)
    tmax = rng.uniform(25, 42, n)
    
    # Ensure tmax > tmin
    for i in range(n):
        if tmax[i] <= tmin[i]:
            tmax[i] = tmin[i] + 1
    
    peffDailyMm = rng.uniform(0, 6, n)
    
    labels = np.array([label_for(r) for r in ratio])
    
    df = pd.DataFrame({
        "ratio": ratio,
        "tmax": tmax,
        "tmin": tmin,
        "peffDailyMm": peffDailyMm,
        "label": labels
    })
    
    return df


def train(output_dir: str = ".", n: int = 5000) -> dict:
    df = generate_dataset(n)
    
    X = df[["ratio", "tmax", "tmin", "peffDailyMm"]]
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True, labels=CLASSES)
    cm = confusion_matrix(y_test, y_pred, labels=CLASSES).tolist()
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    joblib.dump(model, output_path / "model.joblib")
    
    metrics = {
        "accuracy": float(acc),
        "classification_report": report,
        "confusion_matrix": cm,
        "labels": CLASSES,
        "n_samples": int(n),
        "split": "80/20 stratified, random_state=42",
        "note": "synthetic dataset, labels derived from the rule model"
    }
    
    with open(output_path / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)
    
    return metrics


if __name__ == "__main__":
    metrics = train(".")
    print(metrics["accuracy"])