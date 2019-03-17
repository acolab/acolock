import time
import yaml
import subprocess
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from ilock import ILock, ILockException
import json
import bcrypt
import peewee
import datetime
import logging
from playhouse.db_url import connect
import secrets

app = Flask(__name__)

if __name__ != '__main__':
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

db = peewee.SqliteDatabase('acolock.sqlite')
app.config['DATABASE'] = db

class UserAction(peewee.Model):
    username = peewee.CharField(index=True)
    time = peewee.DateTimeField()
    action = peewee.CharField()
    json_data = peewee.TextField()

    class Meta:
        database = db
        db_table = "user_actions"

class UserToken(peewee.Model):
    username = peewee.CharField()
    token = peewee.CharField(index=True)

    class Meta:
        database = db
        db_table = "user_tokens"

def add_user_action(action, data=None):
    username = g.current_username
    if data == None:
        json_data = None
    else:
        json_data = json.dumps(data)

    user_action = UserAction(username=username, time=datetime.datetime.now(), action=action, json_data=json_data)
    user_action.save()

def save_token(username, token):
    user_token = UserToken(username=username, token=token)
    user_token.save()

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

    if "token" in credentials:
        try:
            user_token = UserToken.get(UserToken.token == credentials["token"])
        except peewee.DoesNotExist:
            return False
        username = user_token.username
        password_check_required = False
    elif "username" in credentials and "password" in credentials:
        username = credentials["username"]
        password_check_required = True
    else:
        return False

    if username not in codes:
        return False

    code = codes[username]

    if password_check_required and code["password"] == "":
        return False

    user_is_admin = code.get("admin", False)
    if admin_required and not user_is_admin:
        return False

    if password_check_required:
        password = credentials["password"]
        result = bcrypt.checkpw(password, code["password"])
    else:
        result = True

    if result:
        g.current_username = username
        g.current_user_is_admin = user_is_admin

    return result

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

    add_user_action("open")

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

    add_user_action("close")

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

    updates = request.json["user"]
    username = updates.get("username", "")
    attributes = updates["attributes"]
    new_username = attributes.get("username", None)
    password = attributes.get("password", "")
    admin = attributes.get("admin", None)

    action_data = {
        'username': username,
        'new_username': new_username,
        'new_password': (password != ""),
        'admin': True if admin else False,
    }
    add_user_action("update_user", action_data)

    codes = load_codes()

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

@app.route("/back/delete_user", methods=["POST", "OPTIONS"])
def delete_user_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json, admin_required = True):
        return json.dumps({'success': False, 'error': "invalid_credentials"})

    username = request.json["user"]["username"]

    action_data = {
        'username': username,
    }
    add_user_action("delete_user", action_data)

    codes = load_codes()

    if username not in codes:
        return json.dumps({'success': False, 'error': "invalid_username"})

    del codes[username]
    save_codes(codes)

    return json.dumps({'success': True, 'users': codes})

@app.route("/back/login", methods=["POST", "OPTIONS"])
def login_action():
    if request.method == "OPTIONS":
        return ""

    if not valid_credentials(request.json):
        return json.dumps({'success': False, 'error': "invalid_credentials"})

    token = secrets.token_hex()
    save_token(g.current_username, token)
    return json.dumps({'success': True, 'token': token, 'admin': g.current_user_is_admin})
