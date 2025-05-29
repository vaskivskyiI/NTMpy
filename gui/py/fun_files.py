import eel
import json, os
from numpy import savez, load
from gui.py.variables import flags, laser, layers, nindex, current_file, time, out


# Save File #####################################
@eel.expose
def save_file(filename="ntmpy_save", path="./data/"):
    data_to_save = {
        "flags": flags,
        "laser": laser,
        "layers": layers,
        "nindex": nindex,
        "time": time
    }
    current_file[0] = filename
    try:
        json.dump(data_to_save, open(path + filename + ".json", 'w'), indent=4)
        if flags["result_set"]:
            savez(path + filename, x = out["x"], t=out["t"], Te=out["T"][0], Tl=out["T"][1])
            return("Successfully saved to " + path + filename + ".json and " + path + filename + ".npz")
        return("Successfully saved to " + path + filename + ".json")
    except Exception as e:
        return("Error saving file: "+ str(e))


# Load File #####################################
@eel.expose
def load_file(filename="ntmpy_save", path="./data/"):

    try:
        with open(path + filename, 'r') as f:
            data_loaded = json.load(f)

        flags.clear()
        flags.update(data_loaded.get("flags", {}))

        time.clear()
        time.update( data_loaded.get("time", {}))

        laser.clear()
        laser.update(data_loaded.get("laser", {}))

        layers.clear()
        layers.extend(data_loaded.get("layers", []))

        nindex.clear()
        nindex.extend(data_loaded.get("nindex", []))

        current_file[0] = filename.split(".")[0]

        if flags["result_set"]:
                with load(path + current_file[0] + ".npz") as data:
                    out["t"] = data["t"]
                    out["x"] = data["x"]
                    out["T"] = [data["Te"], data["Tl"]]
                    return("Successfully loaded from " + filename + ".json and " + current_file[0] + ".npz")
        return("Successfully loaded from " + filename)
    except FileNotFoundError:
        return("Error: File " + filename + " not found.")
    except Exception as e:
        return("Error loading file: " + str(e))

# Load File #####################################
@eel.expose
def new_file():

    flags.clear()
    laser.clear()
    layers.clear()
    nindex.clear()
    time.clear()
  
    laser.update({  "energy":       None,
                    "fwhm":         None,
                    "delay":        None,
                    "wavelength":   None,
                    "angle":        None,
                    "polarization": None})
                    
    flags.update({  "reflection": False,
                    "source_set": False,
                    "layers_set": False,
                    "result_set": False})

    current_file[0] = "untitled"


# Explore Files #################################
@eel.expose
def explore_files(path):
    if not path:
        path = load_path()
    try:
        files = [f for f in os.listdir(path) if f.endswith('.json')]
        folders = [f for f in os.listdir(path) if os.path.isdir(os.path.join(path, f))]
        return folders + files
    except Exception as e:
        print("Error exploring files: " + str(e))

# Delete File ###################################
@eel.expose
def delete_file(filename, path = "./data/"):
    try:
        os.remove(path + filename)
        if flags["result_set"]:
            os.remove(path + filename.split(".")[0] + ".npz")
        return("Successfully deleted " + filename + ".json and " + filename + ".npz")
    except Exception as e:
        return("Error deleting file: " + str(e))

# Save and Load Preferences #####################
@eel.expose
def save_path(path):
    with open("./gui/pref/last_path.txt", "w") as f:
        f.write(path)

@eel.expose
def load_path():
    with open("./gui/pref/last_path.txt", "r") as f:
        try:
            return f.read()
        except FileNotFoundError:
            return "./data/"

@eel.expose
def get_filename():
    return(current_file)


