import eel
import json, os
from gui.py.variables import flags, laser, layers, nindex, current_file


# Save File #####################################
@eel.expose
def save_file(filename="ntmpy_save.json", path="./data/"):
    data_to_save = {
        "flags": flags,
        "laser": laser,
        "layers": layers,
        "nindex": nindex,
    }
    current_file[0] = filename
    try:
        json.dump(data_to_save, open(path + filename + ".json", 'w'), indent=4)
        return("Successfully saved to " + path + filename)
    except Exception as e:
        return("Error saving file: "+ str(e))


# Load File #####################################
@eel.expose
def load_file(filename="ntmpy_save.json", path="./data/"):

    try:
        with open(path + filename, 'r') as f:
            data_loaded = json.load(f)

        flags.clear()
        flags.update(data_loaded.get("flags", {}))

        laser.clear()
        laser.update(data_loaded.get("laser", {}))

        layers.clear()
        layers.extend(data_loaded.get("layers", []))

        nindex.clear()
        nindex.extend(data_loaded.get("nindex", []))

        current_file[0] = filename

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

    current_file[0] = "Untitled.json"


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

# Delete File ###################################
@eel.expose
def delete_file(filename, path = "./data/"):
    try:
        os.remove(path + filename)
        return("Successfully deleted " + filename)
    except Exception as e:
        return("Error deleting file: " + str(e))
