import time
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)

if app.config["ENV"] == "development":
    CORS(app, resources={r"/back/*": {"origins": "*"}})

@app.route("/back/ping")
def ping():
    return "pong!"

@app.route("/back/toggle", methods=["POST", "OPTIONS"])
def toggle():
    if request.method == "OPTIONS":
        return ""
    if request.method == "POST":
        time.sleep(1)
        return request.json["username"]
