import time
import yaml
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from ilock import ILock, ILockException
import json
import bcrypt
import peewee
import datetime
from playhouse.db_url import connect

app = Flask(__name__)

db = peewee.SqliteDatabase('acolock.sqlite')
app.config['DATABASE'] = db

class UserAction(peewee.Model):
    username = peewee.CharField(index=True)
    time = peewee.DateTimeField()
    action = peewee.CharField()

    class Meta:
        database = db
        db_table = "user_actions"

def add_user_action(username, action):
    user_action = UserAction(username=username, time=datetime.datetime.now(), action=action)
    user_action.save()

if app.config["ENV"] == "development":
    CORS(app, resources={r"/back/*": {"origins": "*"}})

def save_codes(codes):
    with ILock('codes_write'):
        with open('codes.yml', 'w') as outfile:
            yaml.dump(codes, outfile, default_flow_style=False)

def load_codes():
    try:
        with open("codes.yml", 'r') as stream:
            codes = yaml.load(stream)
    except FileNotFoundError:
        print("Warning: no codes.yml found")
        return {}

    changed = False
    if isinstance(codes, list):
        old_codes = codes
        codes = {}
        for code in old_codes:
            username = code["username"]
            del code["username"]
            codes[username] = code
        changed = True

    if hash_passwords(codes):
        changed = True

    if changed:
        save_codes(codes)

    return codes

def hash_passwords(codes):
    changed = False
    for username, code in codes.items():
        password = code["password"]
        if password[0] != "$":
            code["password"] = hash_password(password)
            changed = True
    return changed

def hash_password(password):
    return bcrypt.hashpw(password, bcrypt.gensalt(12))
def valid_credentials(credentials, admin_required = False):
    codes = load_codes()

    username = credentials["username"]
    if username not in codes:
        return False

    code = codes[username]

    if code["password"] == "":
        return False

    if admin_required and code.get("admin", False) != True:
        return False

    password = credentials["password"]
    return bcrypt.checkpw(password, code["password"])

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

    add_user_action(request.json["username"], "open")

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

    add_user_action(request.json["username"], "close")

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

@app.route("/back/users", methods=["POST", "OPTIONS"])
def codes_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json, admin_required = True):
        return json.dumps({'success': False, 'error': "invalid_credentials"})

    codes = load_codes()
    for username, user in codes.items():
        del user["password"]
    return json.dumps({'success': True, 'users': codes})

@app.route("/back/update_user", methods=["POST", "OPTIONS"])
def update_user_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json, admin_required = True):
        return json.dumps({'success': False, 'error': "invalid_credentials"})

    codes = load_codes()

    updates = request.json["user"]

    username = updates.get("username", "")
    attributes = updates["attributes"]
    new_username = attributes.get("username", None)
    password = attributes.get("password", "")
    admin = attributes.get("admin", None)

    if username == "":
        if new_username == "":
            return json.dumps({'success': False, 'error': "invalid_username"})

        if new_username in codes:
            return json.dumps({'success': False, 'error': "username_already_exists"})
        code = {}
        codes[new_username] = code
    else:
        code = codes[username]

    if password != "":
        code["password"] = hash_password(password)

    if admin != None:
        code["admin"] = admin

    if "password" not in code or code["password"] == "":
        return json.dumps({'success': False, 'error': "empty_password"})

    save_codes(codes)

    return json.dumps({'success': True, 'users': codes})
