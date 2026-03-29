import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# Load dataset
df = pd.read_csv("../data/data.csv")

# Feature engineering
df["temp_avg"] = (df["temp_min"] + df["temp_max"]) / 2
df["rainfall_avg"] = (df["rainfall_min"] + df["rainfall_max"]) / 2

X = df[["temp_avg", "rainfall_avg", "soil", "climate_zone"]]
y = df["tree_name"]

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

# Train
pipeline.fit(X, y)

print("✅ Model trained")

# Save
joblib.dump(pipeline, "tree_model.pkl")
print("💾 Saved as tree_model.pkl")