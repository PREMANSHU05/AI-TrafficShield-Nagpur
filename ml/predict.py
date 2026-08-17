import sys
import json
import re
from pathlib import Path
from joblib import load

MODEL_PATH = Path(__file__).resolve().with_name("traffic_risk_model.joblib")
FEATURE_NAMES = (
    "traffic_density",
    "accident_history",
    "road_condition",
    "weather_risk",
    "night_risk",
)


def main():
    if len(sys.argv) < 2:
        raise ValueError("Expected one JSON input argument")

    raw_input = " ".join(sys.argv[1:])
    try:
        data = json.loads(raw_input)
    except json.JSONDecodeError:
        # PowerShell can remove the JSON property quotes when a command uses
        # Unix-style backslash escaping. Restore this numeric CLI format.
        shell_input = raw_input.replace("\\", "")
        shell_input = re.sub(
            r"([,{]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)",
            r'\1"\2"\3',
            shell_input,
        )
        data = json.loads(shell_input)
    values = []
    for name in FEATURE_NAMES:
        value = data.get(name)
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise ValueError(f"{name} must be a number")
        if not 0 <= value <= 100:
            raise ValueError(f"{name} must be between 0 and 100")
        values.append(value)

    model = load(MODEL_PATH)
    prediction = model.predict([values])[0]
    print(json.dumps({"risk": prediction}))


if __name__ == "__main__":
    try:
        main()
    except (json.JSONDecodeError, ValueError, KeyError) as error:
        print(json.dumps({"error": str(error)}), file=sys.stderr)
        sys.exit(2)
