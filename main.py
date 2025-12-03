from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify
from datetime import datetime, timedelta, UTC
from backend.getAPI import get_daten
from backend.getGEO import geocode
from backend.getPfad import get_stations, get_wetter
import pandas



app = Flask(__name__)



@app.route("/")
def home():
    return render_template("home.html", active_page="home")



@app.route("/Impressum")
def impressum():
    return render_template ("impressum.html", active_page="impressum")



# Wetterarchiv
@app.route("/api/v1/<station>/<date>")
def temperatur(station, date):
    wetterdaten = get_wetter(station)
    df = pandas.read_csv(wetterdaten, skiprows=20, parse_dates=["    DATE"])
    temperatur_als_serie = df.loc[df["    DATE"] == date] ["   TG"]
    if temperatur_als_serie.empty:
        temperatur = "keine Daten vorhanden<br> (möglicherweise liegt die Datumseingabe außerhalb des Aufzeichnungszeitraums)"
    else:
        temperatur_wert = temperatur_als_serie.iloc[0] / 10
        if temperatur_wert < -100:
            temperatur = "Für diesen Tag sind keine Daten vorhanden oder wurden als Messerfehler identifiziert"
        else:
            temperatur = temperatur_wert
    try:
        datum_mod = datetime.strptime(str(date), "%Y%m%d").strftime("%d.%m.%Y")
    except ValueError:
        datum_mod = date

    return {"station": station,
            "date": datum_mod,
            "temperature": temperatur}



@app.route("/api/v1/<station>")
def alle_daten_einer_station(station):
    try:
        wetterdaten = get_wetter(station)
        df = pandas.read_csv(wetterdaten, skiprows=20, parse_dates=["    DATE"])
        return df.to_dict(orient="records")
    except FileNotFoundError as e:
        return jsonify({"Error": str(e)}), 404
    except Exception as e:
        return jsonify({"Error": f"Fehler beim Lesen der Datei"}), 500



@app.route("/api/v1/yearinput/<stationId>/<year>")
def jahreschart(stationId, year):
    try:
        wetterdaten = get_wetter(stationId)
        df = pandas.read_csv(wetterdaten, skiprows=20)
        df["    DATE"] = df["    DATE"].astype(str)
        jahre = df[df["    DATE"].str.startswith(str(year))].to_dict(orient="records")
        return jahre
    except FileNotFoundError as e:
        return jsonify({"Error": str(e)}), 404
    except Exception as e:
        return jsonify({"Error": f"Fehler beim Erstellen der Charts"}), 500



@app.route("/Wetterarchiv")
def wetterarchiv():
    try:
        stationenpfad = get_stations()
        stationen = pandas.read_csv(stationenpfad, skiprows=17)
        stationen.columns = stationen.columns.str.strip()
        stationen = stationen[["STAID", "STANAME"]]
        stationen["STANAME"] = stationen["STANAME"].str.strip().str.upper()
        stationen = stationen.sort_values("STANAME")
        stationen["STANAME_CLEAN"] = stationen["STANAME"].str.strip().str.upper()
        stationen_liste = stationen[["STAID", "STANAME", "STANAME_CLEAN"]].to_dict(orient="records")
        stationen_html = stationen.to_html(index=False)                         # Index=False, weil sonst Pandas Dataframe links eine ID-Spalte setzt
        jahre = list(range(1860,2022))
        return render_template ("wetterarchiv.html", tabelle=stationen_html, stationen=stationen_liste, jahre=jahre, active_page="wetterarchiv")
    
    except Exception as e:
        return render_template("wetterarchiv.html", fehler=str(e))



@app.route("/api/v1/stationen")
def stationen_api():
    try:
        stationenpfad = get_stations()
        stationen = pandas.read_csv(stationenpfad, skiprows=17)
        stationen.columns = stationen.columns.str.strip()
        stationen = stationen[["STAID", "STANAME"]]
        stationen["STANAME"] = stationen["STANAME"].str.strip().str.upper()
        stationen = stationen.sort_values("STANAME")
        stationen["STANAME_CLEAN"] = stationen["STANAME"].str.strip().str.upper()
        stationen_liste = stationen[["STAID", "STANAME", "STANAME_CLEAN"]].to_dict(orient="records")
        return jsonify(stationen_liste)
    except Exception as e:
        return jsonify({"Error": str(e)}), 500



# Wettervorhersage
@app.route("/vorhersage/<stadt>")
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



geocode(app)



@app.route("/3-Tage-Wetter", methods=["GET", "POST"])
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



if __name__ == "__main__":
    app.run(debug=True)
    #app.run(host='0.0.0.0', port=5000, debug=True)
