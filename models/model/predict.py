def recommend_trees(temp, rainfall, soil, climate, top_k=5):

    input_df = pd.DataFrame([{
        "temp_avg": temp,
        "rainfall_avg": rainfall,
        "soil": soil,
        "climate_zone": climate
    }])

    probs = model.predict_proba(input_df)[0]
    classes = model.classes_

    # 👉 add slight randomness (very small)
    noise = np.random.uniform(0, 0.03, size=probs.shape)
    probs = probs + noise

    # normalize (optional but good)
    probs = probs / probs.sum()

    # get top indices
    top_indices = np.argsort(probs)[::-1][:top_k]

    # shuffle slightly (only top results)
    np.random.shuffle(top_indices)

    results = []
    for i in top_indices:
        results.append({
            "tree": classes[i],
            "confidence": round(float(probs[i]), 3)
        })

    return results