from flask import Flask, request, jsonify, send_from_directory
import subprocess
import json
import os

app = Flask(__name__, static_folder='.')

# --- Routes for Static Content ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')

@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')

@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory('images', filename)

@app.route('/workflows/<path:filename>')
def workflow_pages(filename):
    return send_from_directory('workflows', filename)

# --- API Endpoint for Orchestration ---
@app.route('/api/process_onboarding', methods=['POST'])
def process_onboarding():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Trigger the Layer 3 Execution script
        # We pass the JSON data as a string argument to the script
        json_payload = json.dumps(data)
        
        # Run the execution script and capture output
        result = subprocess.run(
            ['python3', 'execution/process_onboarding.py', json_payload],
            capture_output=True, text=True
        )

        if result.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "Onboarding processed successfully",
                "output": result.stdout.strip()
            })
        else:
            return jsonify({
                "status": "error",
                "message": "Script execution failed",
                "error": result.stderr
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use environment variable for port, default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
