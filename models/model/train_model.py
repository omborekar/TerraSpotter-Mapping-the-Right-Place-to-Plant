# Project: TerraSpotter Platform
# Author: Om Borekar
# Year: 2026
# Description: Train and persist the tree recommendation ML model.

import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split, cross_val_score  # ✅ added

# Load dataset
df = pd.read_csv("../data/data.csv")

# Feature engineering
df["temp_avg"] = (df["temp_min"] + df["temp_max"]) / 2
df["rainfall_avg"] = (df["rainfall_min"] + df["rainfall_max"]) / 2

import numpy as np

df["temp_avg"] = df["temp_avg"] + np.random.normal(0, 2, len(df))
df["rainfall_avg"] = df["rainfall_avg"] + np.random.normal(0, 2, len(df))

X = df[["temp_avg", "rainfall_avg", "soil", "climate_zone"]]
y = df["tree_name"]

# ✅ Stratified Split (important)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Preprocessing
preprocessor = ColumnTransformer([
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["soil", "climate_zone"]),
    ("num", "passthrough", ["temp_avg", "rainfall_avg"])
])

# Model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", model)
])

# ✅ Cross-validation (realistic evaluation)
cv_scores = cross_val_score(pipeline, X, y, cv=5)
print("Cross-validation accuracy:", cv_scores.mean())

# ✅ Train
pipeline.fit(X_train, y_train)

# ✅ Test
y_pred = pipeline.predict(X_test)

# ✅ Evaluate
accuracy = accuracy_score(y_test, y_pred)
print("Test Accuracy:", accuracy)

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# Save
joblib.dump(pipeline, "tree_model.pkl")