import sys
import os

# Add model path
sys.path.append(os.path.abspath("../model"))

import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify

# -----------------------------
# Load model + dataset
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "model", "tree_model.pkl"))
data = pd.read_csv(os.path.join(BASE_DIR, "data", "data.csv"))

app = Flask(__name__)

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

        # Get reasons from dataset
        tree_rows = data[data["tree_name"] == tree]

        if not tree_rows.empty:
            tree_info = tree_rows.iloc[0]
            reasons = [
                tree_info["reason_1"],
                tree_info["reason_2"],
                tree_info["reason_3"]
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

        # Basic validation
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
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)