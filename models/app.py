import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

# -----------------------------
# Base directory
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# -----------------------------
# Load model + dataset
# -----------------------------
model_path = os.path.join(BASE_DIR, "tree_model.pkl")
data_path = os.path.join(BASE_DIR, "data", "data.csv")

model = joblib.load(model_path)
data = pd.read_csv(data_path)

# -----------------------------
# Flask app
# -----------------------------
app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "TerraSpotter ML API Running 🚀"

# -----------------------------
# Recommendation function
# -----------------------------
def recommend_trees(temp, rainfall, soil, climate, top_k=5):

    input_df = pd.DataFrame([{
        "temp_avg": temp,
        "rainfall_avg": rainfall,
        "soil": soil,
        "climate_zone": climate
    }])

    probs = model.predict_proba(input_df)[0]
    classes = model.classes_

    top_indices = np.argsort(probs)[::-1][:top_k]

    results = []

    for i in top_indices:
        tree = classes[i]

        tree_rows = data[data["tree_name"] == tree]

        if not tree_rows.empty:
            tree_info = tree_rows.iloc[0]
            reasons = [
                str(tree_info.get("reason_1", "")),
                str(tree_info.get("reason_2", "")),
                str(tree_info.get("reason_3", ""))
            ]
        else:
            reasons = ["Suitable for given conditions"]

        results.append({
            "tree": tree,
            "confidence": round(float(probs[i]), 3),
            "reasons": reasons
        })

    return results

# -----------------------------
# API Route
# -----------------------------
@app.route("/predict", methods=["GET"])
def predict():
    try:
        temp = float(request.args.get("temp"))
        rainfall = float(request.args.get("rainfall"))
        soil = request.args.get("soil")
        climate = request.args.get("climate")

        if not all([soil, climate]):
            return jsonify({"error": "Missing parameters"}), 400

        result = recommend_trees(temp, rainfall, soil, climate)

        return jsonify({
            "input": {
                "temp": temp,
                "rainfall": rainfall,
                "soil": soil,
                "climate": climate
            },
            "recommendations": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Run server (local only)
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)