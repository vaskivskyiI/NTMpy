import eel
import json
from gui.python.variables import flags, laser, layers, nindex, sim, src


# Run Simulation #################################
@eel.expose
def run():
    src_init()
    build_material()



# Save File #####################################
@eel.expose
def save_file(filename="ntmpy_save.json"):
    data_to_save = {
        "flags": flags,
        "laser": laser,
        "layers": layers,
        "nindex": nindex,
        "sim_parameters": {
            # Assuming sim has attributes like 'time_steps', 'dt', etc.
            # Add relevant sim attributes here
        },
        "src_parameters": {
            "angle": src.angle,
            "absorption": src.absorption,
            "delay": src.delay,
            "thickness": src.thickness
            # Add other relevant src attributes here, e.g., from setLaser if they are stored
        }
    }
    try:
        with open(filename, 'w') as f:
            json.dump(data_to_save, f, indent=4)
        return f"Successfully saved to {filename}"
    except Exception as e:
        return f"Error saving file: {str(e)}"


# Load File #####################################
@eel.expose
def load_file(filename="ntmpy_save.json"):
    global flags, laser, layers, nindex # Declare them global to modify
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

        # Update sim object attributes
        # This requires knowing sim's structure and how to update it
        # For example, if sim has attributes directly:
        sim_params = data_loaded.get("sim_parameters", {})
        # for key, value in sim_params.items():
        # setattr(sim, key, value) # Be cautious with setattr

        # Update src object attributes
        src_params = data_loaded.get("src_parameters", {})
        if "angle" in src_params:
            src.angle = src_params["angle"]
        if "absorption" in src_params:
            src.absorption = src_params["absorption"]
        if "delay" in src_params:
            src.delay = src_params["delay"]
        if "thickness" in src_params:
            src.thickness = src_params["thickness"]
        # Potentially re-initialize parts of src or sim if necessary
        # e.g. src.setLaser if energy/fwhm are loaded and need processing

        return f"Successfully loaded from {filename}"
    except FileNotFoundError:
        return f"Error: File {filename} not found."
    except Exception as e:
        return f"Error loading file: {str(e)}"


# Build Material ####################################
def build_material():
    for layer in layers:
        length = float(layer["length"])
        cond = [eval("lambda Te, Tl: " + layer["K"][0]), eval("lambda Te, Tl: " + layer["K"][1])]
        capc = [eval("lambda Te, Tl: " + layer["C"][0]), eval("lambda Te, Tl: " + layer["C"][1])]
        coup =  eval("lambda Te, Tl: " + layer["G"])
        dens = float(layer["rho"])
        sim.addLayer( length, cond, capc, dens, coup)


# Initialize Source #################################
def src_init():
    if not flags["source_set"] or True:
        src.angle = 0
        src.setLaser(float(laser["energy"]), float(laser["fwhm"]))
        src.absorption = [float(n["l"]) for n in nindex]
        src.delay = float(laser["delay"])
        src.thickness = [float(layer["length"]) for layer in layers]
