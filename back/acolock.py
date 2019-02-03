import time
import yaml
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from ilock import ILock, ILockException
import hmac
app = Flask(__name__)

if app.config["ENV"] == "development":
    CORS(app, resources={r"/back/*": {"origins": "*"}})

def save_codes(codes):
    with ILock('codes_write'):
        with open('codes.yml', 'w') as outfile:
            yaml.dump(codes, outfile, default_flow_style=False)

def valid_credentials(credentials):
    try:
        with open("codes.yml", 'r') as stream:
            codes = yaml.load(stream)
    except FileNotFoundError:
        print("Warning: no codes.yml found")
        return False

    if isinstance(codes, list):
        old_codes = codes
        codes = {}
        for code in old_codes:
            username = code["username"]
            del code["username"]
            codes[username] = code
        save_codes(codes)

    username = credentials["username"]
    if username not in codes:
        return False

    code = codes[username]

    password = credentials["password"]
    return hmac.compare_digest(password, code["password"])

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
    result = subprocess.run(["venv/bin/python", "lock_control.py", command])
    if result.returncode != 0:
        return False
    state = get_lock_state()
    state["open"] = open
    save_lock_state(state)
    return True

def toggle_lock():
    state = get_lock_state()
    open = state.get("open", False)
    new_open = (not open)
    return lock_control(new_open)

def open_lock():
    return lock_control(True)

def close_lock():
    return lock_control(False)

@app.route("/back/toggle", methods=["POST", "OPTIONS"])
def toggle_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    if toggle_lock():
        return "ok"
    else:
        return "lock_control_failed"

@app.route("/back/open", methods=["POST", "OPTIONS"])
def open_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    if open_lock():
        return "ok"
    else:
        return "lock_control_failed"

@app.route("/back/close", methods=["POST", "OPTIONS"])
def close_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return "invalid_credentials"

    if close_lock():
        return "ok"
    else:
        return "lock_control_failed"

@app.route("/back/lock_state", methods=["GET", "OPTIONS"])
def lock_state_action():
    if request.method == "OPTIONS":
        return ""

    state = get_lock_state()
    if state.get("open", False):
        return "open"
    else:
        return "closed"
