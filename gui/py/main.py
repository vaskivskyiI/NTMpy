import sys
import eel

sys.path.insert(0, './code')
from Sim2T import Sim2T # type: ignore
from Source import source # type: ignore
from numpy import array, savez, load # type: ignore
import numpy as np
from copy import deepcopy as copy

from gui.py.variables import flags, laser, layers, nindex, src, out, time, current_file


# Run Simulation #################################
@eel.expose
def run_simulation(final_time):
    time["simulation"] = final_time
    src_init()
    sim = build_material()
    if isinstance(sim, int):
        return "Error: some material property is not valid (maybe layer " + str(sim+1) + ")"
    sim.setSource(src)
    sim.final_time = float(final_time)
    [out["x"], out["t"], out["T"]] = sim.run()

    if final_time >= 1:
        time["simulation"] = sim.time_step * final_time

    time["computation"] = sim.computation_time
    flags["result_set"] = True
    

# Build Material ####################################
def build_material():
    sim = Sim2T()
    safe_layers = sanitize(layers)
    if isinstance(safe_layers, int): return safe_layers
    for layer in safe_layers:
        length = layer["length"]
        dens = layer["rho"]
        cond = [eval(layer["K"][0]), eval(layer["K"][1])]
        capc = [eval(layer["C"][0]), eval(layer["C"][1])]
        coup =  eval(layer["G"])
        sim.addLayer( length, cond, capc, dens, coup, 16)
    return sim

# Initialize Source #################################
def src_init():
    if flags["source_set"]:
        src.setLaser(float(laser["energy"]), float(laser["fwhm"]))
        src.delay = float(laser["delay"])
    if flags["layers_set"]:
        if flags["reflection"]:
            src.type_x = "reflection"
            src.refraction = [float(n["nr"]) + 1j * float(n["ni"]) for n in nindex]
            src.angle = laser["angle"]
            src.polarization = laser["polarization"]
            src.wavelength = laser["wavelength"]
        else:
            src.type_x = "lambertbeer"
            src.absorption = [float(n["l"]) for n in nindex]
        src.thickness = [float(layer["length"]) for layer in layers]

# Get Computation Time ##########################
@eel.expose
def getTime(what):
    return time[what]


# Sanitize Input ################################
def sanitize(layers):
    safe_layers = copy(layers)
    for index, layer in enumerate(safe_layers):
        safe_layers[index]["C"][0] = input_control(layer["C"][0])
        if safe_layers[index]["C"][0] == -1: return index
        safe_layers[index]["C"][1] = input_control(layer["C"][1])
        if safe_layers[index]["C"][1] == -1: return index
        safe_layers[index]["K"][0] = input_control(layer["K"][0])
        if safe_layers[index]["K"][0] == -1: return index
        safe_layers[index]["K"][1] = input_control(layer["K"][1])
        if safe_layers[index]["K"][1] == -1: return index
        safe_layers[index]["G"] = input_control(layer["G"])
        if safe_layers[index]["G"] == -1: return index
    return safe_layers



def input_control(input):
    try:
        f = eval(input)
        return input
    except:
        try:
            f = eval("lambda Te, Tl:" + input)
            dummy = f(array([1,2,3]), array([1,2,3]))
            return "lambda Te, Tl:" + input
        except:
            try:
                f = eval("lambda T:" + input)
                dummy = f(array([1,2,3]))
                return "lambda T:" + input
            except:
                return -1