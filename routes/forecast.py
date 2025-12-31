from flask import Blueprint
from flask import render_template
from flask import request
from flask import jsonify
from datetime import datetime, timedelta, UTC
from backend.getAPI import get_daten



forecastRoutes = Blueprint("forecast", __name__)



@forecastRoutes.route("/vorhersage/<stadt>")
def vorhersage(stadt):
    try:
        tage = 3
        daten = get_daten(stadt, tage)
        offset = timedelta(seconds=daten['timezone'])
        for eintrag in daten["list"]:
            utc_time = datetime.fromtimestamp(eintrag["dt"], tz=UTC)
            local_time = utc_time + offset
            eintrag['local_time'] = local_time.strftime('%Y-%m-%d %H:%M')
        return jsonify(daten)
    except Exception as e:
        return jsonify({"error": str(e)})



@forecastRoutes.route("/wettervorhersage", methods=["GET", "POST"])
def wettervorhersage_3_Tage():
    if request.method == "POST":
        stadt = request.form.get("stadt")
        tage = 3
        try:
            daten = get_daten(stadt, tage)
            offset = timedelta(seconds=daten['timezone'])
            for eintrag in daten["list"]:
                utc_time = datetime.fromtimestamp(eintrag["dt"], tz=UTC)
                local_time = utc_time + offset
                eintrag['local_time'] = local_time.strftime('%Y-%m-%d %H:%M')
            return render_template("wettervorhersage.html", daten=daten["list"], stadt=stadt, tage=tage)
        except Exception as e:
            return render_template("wettervorhersage.html", fehler=str(e))

    return render_template("wettervorhersage.html", active_page="vorhersage")
