from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)

# Configure CORS based on environment
if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, resources={r"/*": {"origins": ["https://dtxr-mini-project.vercel.app"]}})
else:
    CORS(app)  # Allow all in development

# Enhanced light state with timestamp
light_state = {
    "status": "OFF",
    "brightness": 50,
    "currentPower": 0,
    "lastUpdated": datetime.utcnow().isoformat(),
    "energyConsumed": 0.0  # Track total energy in Wh
}

# Power constants
MAX_POWER = 10  # Watts at 100% brightness
BASE_POWER = 0.5  # Standby power
RATE = 0.12  # $/kWh

def calculate_current_power(state):
    """Calculate power consumption based on state"""
    return (state["brightness"] / 100) * MAX_POWER if state["status"] == "ON" else BASE_POWER

def update_energy_consumption(state):
    """Update total energy consumed"""
    now = datetime.utcnow()
    last_updated = datetime.fromisoformat(state["lastUpdated"])
    hours = (now - last_updated).total_seconds() / 3600
    state["energyConsumed"] += state["currentPower"] * hours
    state["lastUpdated"] = now.isoformat()

@app.route("/toggle-light", methods=["POST", "GET"])
def light_control():
    global light_state
    
    if request.method == 'POST':
        data = request.json
        update_energy_consumption(light_state)
        
        light_state.update({
            "status": data.get("state", light_state["status"]),
            "brightness": data.get("brightness", light_state["brightness"])
        })
    
    # Always update power and timestamp
    light_state["currentPower"] = calculate_current_power(light_state)
    light_state["lastUpdated"] = datetime.utcnow().isoformat()
    
    response = {
        **light_state,
        "costEstimate": (light_state["currentPower"] * RATE / 1000),
        "totalCost": (light_state["energyConsumed"] * RATE / 1000)
    }
    
    return jsonify(response)

# Health check endpoint
@app.route("/health")
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })

# Vercel WSGI handler
def handler(event, context):
    from flask import Response
    with app.app_context():
        response = app.full_dispatch_request()
        return Response(
            response.get_data(),
            status=response.status_code,
            headers=dict(response.headers)
        )

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
