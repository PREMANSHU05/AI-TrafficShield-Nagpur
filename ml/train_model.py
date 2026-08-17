from sklearn.ensemble import RandomForestClassifier
from joblib import dump
from pathlib import Path

data = {
    "traffic_density": [
        20, 30, 40, 50, 60,
        70, 75, 80, 85, 90,
        95, 25, 45, 65, 88
    ],

    "accident_history": [
        10, 15, 20, 25, 30,
        45, 50, 55, 65, 70,
        85, 12, 28, 40, 75
    ],

    "road_condition": [
        90, 85, 80, 75, 70,
        65, 60, 55, 50, 45,
        40, 88, 78, 68, 48
    ],

    "weather_risk": [
        10, 15, 20, 25, 30,
        35, 40, 45, 50, 60,
        70, 12, 25, 38, 55
    ],

    "night_risk": [
        10, 20, 25, 30, 35,
        45, 50, 55, 60, 70,
        80, 15, 30, 40, 65
    ],

    "risk": [
        "Low", "Low", "Low", "Low", "Low",
        "Medium", "Medium", "Medium", "High", "High",
        "High", "Low", "Low", "Medium", "High"
    ]
}

feature_names = (
    "traffic_density",
    "accident_history",
    "road_condition",
    "weather_risk",
    "night_risk",
)
X = list(zip(*(data[name] for name in feature_names)))
y = data["risk"]

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)

model_path = Path(__file__).resolve().with_name("traffic_risk_model.joblib")
dump(model, model_path)

print("ML model trained successfully!")
