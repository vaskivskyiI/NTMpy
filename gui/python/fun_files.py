import eel
import json
from gui.python.variables import flags, laser, layers, nindex


# Save File #####################################
@eel.expose
def save_file(filename="data//ntmpy_save.json"):
    data_to_save = {
        "flags": flags,
        "laser": laser,
        "layers": layers,
        "nindex": nindex,
    }
    try:
        json.dump(data_to_save, open(filename, 'w'), indent=4)
        return("Successfully saved to " + filename)
    except Exception as e:
        return("Error saving file: "+ str(e))


# Load File #####################################
@eel.expose
def load_file(filename="data//ntmpy_save.json"):

    try:
        with open(filename, 'r') as f:
            data_loaded = json.load(f)

        flags.clear()
        flags.update(data_loaded.get("flags", {}))

        laser.clear()
        laser.update(data_loaded.get("laser", {}))

        layers.clear()
        layers.extend(data_loaded.get("layers", []))

        nindex.clear()
        nindex.extend(data_loaded.get("nindex", []))


        return("Successfully loaded from " + filename)
    except FileNotFoundError:
        return("Error: File " + filename + " not found.")
    except Exception as e:
        return("Error loading file: " + str(e))