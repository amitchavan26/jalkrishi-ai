import json
import pytest
import pandas as pd
import numpy as np

from train import label_for, generate_dataset, train, CLASSES


def test_label_boundaries():
    assert label_for(1.0) == "EXCELLENT"
    assert label_for(0.8) == "GOOD"
    assert label_for(0.79) == "RISKY"
    assert label_for(0.6) == "RISKY"
    assert label_for(0.59) == "NOT_RECOMMENDED"


def test_dataset_shape():
    df = generate_dataset(5000, 42)
    assert len(df) == 5000
    assert list(df.columns) == ["ratio", "tmax", "tmin", "peffDailyMm", "label"]
    assert (df["tmax"] > df["tmin"]).all()
    for cls in CLASSES:
        assert (df["label"] == cls).any()


def test_train_writes_files(tmp_path):
    metrics = train(str(tmp_path))
    assert (tmp_path / "model.joblib").exists()
    assert (tmp_path / "metrics.json").exists()


def test_metrics_content(tmp_path):
    metrics = train(str(tmp_path))
    assert metrics["accuracy"] > 0.9
    
    with open(tmp_path / "metrics.json") as f:
        saved = json.load(f)
    
    expected_keys = {"accuracy", "classification_report", "confusion_matrix", "labels", "n_samples", "split", "note"}
    assert set(saved.keys()) == expected_keys
    assert saved["labels"] == CLASSES
    assert saved["n_samples"] == 5000
    assert saved["split"] == "80/20 stratified, random_state=42"
    assert saved["note"] == "synthetic dataset, labels derived from the rule model"