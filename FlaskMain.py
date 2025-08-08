from flask import Flask, render_template
from flask import request
from flask import jsonify
from datetime import datetime, timedelta, UTC
from WetterAPI_Backend import get_daten
from station_def import get_stations, get_wetter
import pandas
#import json



app = Flask(__name__)

@app.route("/")
def home():
    return render_template ("index.html")


# Wetterarchiv - Hauptelemente
@app.route("/Wetterarchiv")
def wetterarchiv():
    stationenpfad = get_stations()
    stationen = pandas.read_csv(stationenpfad, skiprows=17)
    stationen.columns = stationen.columns.str.strip()
    stationen = stationen[["STAID", "STANAME"]]
    stationen = stationen.sort_values("STANAME")
    stationen_liste = stationen.to_dict(orient="records")
    stationen_html = stationen.to_html(index=False)                         # Index=False, weil sonst Pandas Dataframe links eine ID-Spalte setzt
    jahre = list(range(1860,2022))
    return render_template ("wetterarchiv.html",
                            tabelle=stationen_html,
                            stationen=stationen_liste,
                            jahre=jahre)


# Wetterarchiv - Backend-Routine für Temperatur pro Tag
@app.route("/api/v1/<station>/<date>")
def temperatur(station, date):
    wetterdaten = get_wetter(station)
    df = pandas.read_csv(wetterdaten, skiprows=20, parse_dates=["    DATE"])
    temperatur_als_serie = df.loc[df["    DATE"] == date] ["   TG"]
    if temperatur_als_serie.empty:
        temperatur = "keine Daten vorhanden<br>- möglicherweise liegt die Datumseingabe außerhalb des Aufzeichnungszeitraums -"
    else:
        temperatur_wert = temperatur_als_serie.iloc[0] / 10
        if temperatur_wert < -100:
            temperatur = "Für diesen Tag sind keine Daten vorhanden oder wurden als falsch identifiziert"
        else:
            temperatur = temperatur_wert
    try:
        datum_mod = datetime.strptime(str(date), "%Y%m%d").strftime("%d.%m.%Y")
    except ValueError:
        datum_mod = date

    return {"station": station,
            "date": datum_mod,
            "temperature": temperatur}


# Wetterarchiv - Backend-Routine für Wetterstation
@app.route("/api/v1/<station>")
def alle_daten_einer_station(station):
    wetterdaten = r"C:\Users\Proto\Desktop\Programmierer\Programmieren\Großprojekte\3. Wetter API\Wetterdaten\data\TG_STAID" + str(station).zfill(6) + ".txt"
    df = pandas.read_csv(wetterdaten, skiprows=20, parse_dates=["    DATE"])
    alle_daten = df.to_dict(orient="records")
    return alle_daten


# Wetterarchiv - Backend-Routine für Jahr/Jahrescharts
@app.route("/api/v1/yearinput/<station>/<year>")
def jahreschart(station, year):
    wetterdaten = r"C:\Users\Proto\Desktop\Programmierer\Programmieren\Großprojekte\3. Wetter API\Wetterdaten\data\TG_STAID" + str(station).zfill(6) + ".txt"
    df = pandas.read_csv(wetterdaten, skiprows=20)
    df["    DATE"] = df["    DATE"].astype(str)
    jahre = df[df["    DATE"].str.startswith(str(year))].to_dict(orient="records")
    return jahre




# Wettervorhersage - Backend-Routine
@app.route("/vorhersage/<stadt>", methods=["GET"])
def vorhersage(stadt):
    try:
        tage = 3
        daten = get_daten(stadt, tage)
        return jsonify(daten)
    except Exception as e:
        return jsonify({"error": str(e)})


# Wettervorhersage - Frontend-Anbindung
@app.route("/3-Tage-Wetter", methods=["GET", "POST"])
def wettervorhersage_3_Tage():
    if request.method == "POST":
        stadt = request.form.get("stadt")
        tage = 3
        try:
            daten = get_daten(stadt, tage)
            #print(json.dumps(daten, indent=2))
            offset = timedelta(seconds=daten['timezone'])
            for eintrag in daten["list"]:
                utc_time = datetime.fromtimestamp(eintrag["dt"], tz=UTC)
                local_time = utc_time + offset
                eintrag['local_time'] = local_time.strftime('%Y-%m-%d %H:%M')
            return render_template("wettervorhersage.html", daten=daten["list"], stadt=stadt, tage=tage)
        except Exception as e:
            return render_template("wettervorhersage.html", fehler=str(e))

    return render_template("wettervorhersage.html")





# Impressum
@app.route("/Impressum")
def impressum():
    return render_template ("impressum.html")



if __name__ == "__main__":
    app.run(debug=True)
