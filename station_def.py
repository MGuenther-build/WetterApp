import os

def get_stations():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "Wetterdaten", "data")
    get_stations_path = os.path.join(data_dir, "stations.txt")
    if not os.path.exists(get_stations_path):
        raise FileNotFoundError(f"Datei nicht gefunden: {get_stations_path}")
    
    return get_stations_path


def get_wetter(station):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "Wetterdaten", "data")
    get_wetter_path = os.path.join(data_dir, f"TG_STAID{str(station).zfill(6)}.txt")
    if not os.path.exists(get_wetter_path):
        raise FileNotFoundError(f"Wetterdaten nicht gefunden: {get_wetter_path}")
    
    return get_wetter_path
