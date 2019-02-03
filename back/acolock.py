import time
import yaml
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)

if app.config["ENV"] == "development":
    CORS(app, resources={r"/back/*": {"origins": "*"}})

def valid_credentials(credentials):
    try:
        with open("codes.yml", 'r') as stream:
            codes = yaml.load(stream)
    except FileNotFoundError:
        print("Warning: no codes.yml found")
        return False

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

def lock_control(open):
    if open:
        command = "open"
    else:
        command = "close"
    print("Command: " + command)
    subprocess.run(["venv/bin/python", "lock_control.py", command])
    state = get_lock_state()
    state["open"] = open
    save_lock_state(state)

def toggle_lock():
    state = get_lock_state()
    open = state.get("open", False)
    new_open = (not open)
    lock_control(new_open)

def open_lock():
    lock_control(True)

def close_lock():
    lock_control(False)

@app.route("/back/toggle", methods=["POST", "OPTIONS"])
def toggle_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    toggle_lock()
    return "ok"

@app.route("/back/open", methods=["POST", "OPTIONS"])
def open_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    open_lock()
    return "ok"

@app.route("/back/close", methods=["POST", "OPTIONS"])
def close_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    close_lock()
    return "ok"

@app.route("/back/lock_state", methods=["GET", "OPTIONS"])
def lock_state_action():
    if request.method == "OPTIONS":
        return ""

    state = get_lock_state()
    if state.get("open", False):
        return "open"
    else:
        return "closed"
