import time
import yaml
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)

if app.config["ENV"] == "development":
    CORS(app, resources={r"/back/*": {"origins": "*"}})

def valid_credentials(credentials):
    with open("codes.yml", 'r') as stream:
        codes = yaml.load(stream)
    found = False
    for code in codes:
        username_found = code["username"] == credentials["username"]
        password_found = code["password"] == credentials["password"]
        if username_found and password_found:
            found = True
    return found

def get_lock_state():
    try:
        with open("lock_state.yml", 'r') as stream:
            state = yaml.load(stream)
    except FileNotFoundError:
        state = {}
    return state

def save_lock_state(state):
    with open('lock_state.yml', 'w') as outfile:
        yaml.dump(state, outfile, default_flow_style=False)

def toggle_lock():
    state = get_lock_state()
    open = state.get("open", False)
    if open:
        command = "close"
    else:
        command = "open"
    print("Command: " + command)
    if app.config["ENV"] == "development":
        subprocess.run(["echo", "../lock_control/lock_control.py", command])
    else:
        subprocess.run(["../lock_control/lock_control.py", command])
    state["open"] = (not open)
    save_lock_state(state)

@app.route("/back/ping")
def ping():
    return "pong!"

@app.route("/back/toggle", methods=["POST", "OPTIONS"])
def toggle():
    if request.method == "OPTIONS":
        return ""
    if request.method == "POST":
        if valid_credentials(request.json):
            toggle_lock()
            return "ok"
        else:
            return "fail"
