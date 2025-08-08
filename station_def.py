import os

def get_stations():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "Wetterdaten", "data")
    return os.path.join(data_dir, "stations.txt")


def get_wetter(station):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "Wetterdaten", "data")
    return os.path.join(data_dir, f"TG_STAID{str(station).zfill(6)}.txt")