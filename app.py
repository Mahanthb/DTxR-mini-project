from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS

# Initial state
light_state = {
    "status": "OFF",
    "brightness": 50,
    "currentPower": 0  # Watts being used right now
}

# Constants for power calculation
MAX_POWER = 10  # Watts at 100% brightness
BASE_POWER = 0.5  # Watts when "off" (standby power)

def calculate_current_power(state):
    if state["status"] == "ON":
        return (state["brightness"] / 100) * MAX_POWER
    return BASE_POWER

@app.route("/toggle-light", methods=["POST"])
def toggle_light():
    global light_state
    data = request.json
    
    light_state = {
        "status": data.get("state", "OFF"),
        "brightness": data.get("brightness", light_state["brightness"])
    }
    
    # Calculate current power usage
    light_state["currentPower"] = calculate_current_power(light_state)
    
    return jsonify({
        "message": f"Light turned {light_state['status']}",
        **light_state
    })

@app.route("/toggle-light", methods=["GET"])
def get_light_state():
    # Just return the current state with current power calculation
    light_state["currentPower"] = calculate_current_power(light_state)
    return jsonify(light_state)

if __name__ == "__main__":
    app.run(debug=True, port=5000)