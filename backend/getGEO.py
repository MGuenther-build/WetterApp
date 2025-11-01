import os
import requests
from flask import jsonify, request
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")


def geocode(app):
    @app.route("/api/geocode")
    def geocodeRoute():
        ort = request.args.get("q")
        if not ort:
            return jsonify([])
        try:
            response = requests.get(
                "http://api.openweathermap.org/geo/1.0/direct",
                params={"q": ort, "limit": 10, "appid": API_KEY}
            )
            data = response.json()
            return jsonify(data)
        except Exception:
            return jsonify([]), 500
