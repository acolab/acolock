import time
from flask import Flask
app = Flask(__name__)

if app.config["ENV"] == "development":
    @app.after_request
    def after_request(response):
        header = response.headers
        header['Access-Control-Allow-Origin'] = '*'
        return response

@app.route("/back/ping")
def ping():
    return "pong!"

@app.route("/back/toggle")
def toggle():
    time.sleep(2)
    return "ok"
