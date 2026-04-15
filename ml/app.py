from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
CORS(app)


def calculate_risk_score(temp, usage_pct, items_expiring_soon):
    score = 0
    if temp > 8:
        score += 4
    elif temp > 6:
        score += 2

    if usage_pct > 85:
        score += 3
    elif usage_pct > 70:
        score += 1

    if items_expiring_soon > 3:
        score += 3
    elif items_expiring_soon > 1:
        score += 2

    score = min(score, 10)

    if score >= 7:
        status = "critical"
    elif score >= 4:
        status = "warning"
    else:
        status = "normal"

    return score, status


def generate_alternatives(score, temp, usage_pct, items_expiring_soon):
    alternatives = []
    if score > 5:
        discount_savings = items_expiring_soon * 45
        transfer_cost = items_expiring_soon * 12
        projected_loss = items_expiring_soon * 65

        alternatives.append({
            "action": "Flash discount perishables",
            "cost": round(items_expiring_soon * 10, 2),
            "savings": round(discount_savings, 2),
            "recommendation": "high" if items_expiring_soon > 3 else "medium"
        })
        alternatives.append({
            "action": "Transfer to nearby store",
            "cost": round(transfer_cost, 2),
            "savings": round(projected_loss * 0.6, 2),
            "recommendation": "medium" if usage_pct > 85 else "low"
        })
        alternatives.append({
            "action": "Accept projected loss",
            "cost": 0,
            "savings": 0,
            "recommendation": "low"
        })
    return alternatives


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK", "message": "ML Service is running"})


@app.route("/score", methods=["POST"])
def score():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON payload provided"}), 400

        temp = float(data.get("temp", 4))
        usage_pct = float(data.get("usagePct", 50))
        items_expiring_soon = int(data.get("itemsExpiringSoon", 0))

        risk_score, status = calculate_risk_score(temp, usage_pct, items_expiring_soon)
        alternatives = generate_alternatives(risk_score, temp, usage_pct, items_expiring_soon)

        return jsonify({
            "riskScore": risk_score,
            "status": status,
            "alternatives": alternatives,
            "input": {
                "temp": temp,
                "usagePct": usage_pct,
                "itemsExpiringSoon": items_expiring_soon
            }
        })
    except Exception as e:
        return jsonify({"error": str(e), "riskScore": 5, "status": "warning", "alternatives": []}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
