import requests
import logging
from datetime import datetime, timedelta, timezone
from collections import Counter
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")



def daten_pro_tag(daten_liste, timezone_offset):
    zaehler = Counter()
    for eintrag in daten_liste:
        timestamp = eintrag["dt"]
        datum = datetime.fromtimestamp(timestamp, tz=timezone.utc) + timedelta(seconds=timezone_offset)
        zaehler[datum.date()] += 1
    return zaehler



def erlaubte_tage(daten_liste, timezone_offset):
    utc_now = datetime.now(timezone.utc)
    local = utc_now + timedelta(seconds=timezone_offset)
    heute = local.date()
    morgen = heute + timedelta(days=1)
    uebermorgen = heute + timedelta(days=2)
    ueberuebermorgen = heute + timedelta(days=3)
    zaehler = daten_pro_tag(daten_liste, timezone_offset)
    erlaubte = {morgen, uebermorgen}
    if zaehler.get(heute, 0) > 0:
        erlaubte.add(heute)
    else:
        erlaubte.add(ueberuebermorgen)
    return erlaubte



WOCHENTAGE = {0: "Mo", 1: "Di", 2: "Mi", 3: "Do", 4: "Fr", 5: "Sa", 6: "So"}
def heute_morgen_uebermorgen(timestamp, timezone_offset):
    utc_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)
    local_time = utc_time + timedelta(seconds=timezone_offset)
    heute = (datetime.now(timezone.utc) + timedelta(seconds=timezone_offset)).date()
    datum = local_time.date()
    if datum == heute:
        return "Heute"
    else:
        wochentag = WOCHENTAGE[datum.weekday()]
        return f"{wochentag}, {datum.strftime('%d.%m.')}"



def get_daten(Stadt_waehlen, Tage_der_Vorhersage=None):
    try:
        url = f"http://api.openweathermap.org/data/2.5/forecast?q={Stadt_waehlen}&appid={API_KEY}&units=metric&lang=de"
        response = requests.get(url)
        daten = response.json()
    except requests.exceptions.Timeout:
        logging.error("Timeout Abruf API")
        raise RuntimeError("Die Anfrage hat zu lange gedauert")
    except requests.exceptions.HTTPError as e:
        logging.error(f"HTTP-Fehler {e}")
        raise RuntimeError("Stadt konnte nicht gefunden werden")
    except requests.exceptions.RequestException as f:
        logging.error(f"Verbindungsfehler {e}")
        raise RuntimeError("Verbindung konnte nicht hergestellt werden. Versuchen Sie es später nochmal.")
    except ValueError as g:
        logging.error(f"Fehler JSON-Daten {g}")
        raise RuntimeError("fehlerhafte Daten")

    if "list" not in daten or not daten.get("city"):
        raise ValueError ("Stadt nicht gefunden")
    
    # Filterung Tage der Vorhersage
    daten_fein = daten["list"]
    werte = 8 * Tage_der_Vorhersage
    daten_fein = daten_fein[:werte]
    
    # Integration der Bezeichner
    vorhersage_3_Tage = []
    timezone_offset = daten["city"]["timezone"]
    erlaubte_tage_set = erlaubte_tage(daten["list"], timezone_offset)
    for i in daten["list"]:
        timestamp = i["dt"]
        datum = datetime.fromtimestamp(timestamp, tz=timezone.utc) + timedelta(seconds=timezone_offset)
        if datum.date() in erlaubte_tage_set:
            i["drei_tage"] = heute_morgen_uebermorgen(timestamp, timezone_offset)
            vorhersage_3_Tage.append(i)
    return {
        "list": vorhersage_3_Tage,
        "timezone": daten["city"]["timezone"]
    }
