import joblib
import pandas as pd
import numpy as np

model = joblib.load("tree_model.pkl")

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
        results.append({
            "tree": classes[i],
            "confidence": round(float(probs[i]), 3)
        })

    return results


if __name__ == "__main__":
    print(recommend_trees(30, 900, "loamy", "tropical"))