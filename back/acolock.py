import time
import yaml
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

@app.route("/back/ping")
def ping():
    return "pong!"

@app.route("/back/toggle", methods=["POST", "OPTIONS"])
def toggle():
    if request.method == "OPTIONS":
        return ""
    if request.method == "POST":
        if valid_credentials(request.json):
            return "ok"
        else:
            return "fail"
