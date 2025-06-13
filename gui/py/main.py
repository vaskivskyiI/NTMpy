import eel

from core.Sim2T import Sim2T
from core.Sim3T import Sim3T
from core.Sim2T1L import Sim2T1L
from core.Source import source # type: ignore
from numpy import array, savez, load # type: ignore
import numpy as np
from copy import deepcopy as copy

from gui.py.variables import flags, laser, layers, nindex, src, out, time, current_file


# Run Simulation #################################
@eel.expose
def runSimulation(final_time):
    time["simulation"] = final_time
    src_init()
    sim = build_material(layers)
    if flags["substrate"]: sim.substrate = True
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
def build_material(layers=layers, precision=15):
    safe_layers = sanitize(layers)
    if isinstance(safe_layers, int): return safe_layers
    
    if not flags["spin_temp"] and len(layers) > 1:
        sim = Sim2T()
        for layer in safe_layers:
            length = layer["length"]
            dens = layer["rho"]
            cond = [eval(layer["K"][0]), eval(layer["K"][1])]
            capc = [eval(layer["C"][0]), eval(layer["C"][1])]
            coup =  eval(layer["G"][0])
            print(coup)
            sim.addLayer( length, cond, capc, dens, coup, precision)
        return sim
    elif not flags["spin_temp"] and len(layers) == 1:
        sim = Sim2T1L()
        length = safe_layers[0]["length"]
        dens = safe_layers[0]["rho"]
        cond = [eval(safe_layers[0]["K"][0]), eval(safe_layers[0]["K"][1])]
        capc = [eval(safe_layers[0]["C"][0]), eval(safe_layers[0]["C"][1])]
        coup =  eval(safe_layers[0]["G"][0])
        sim.setMaterial( length, cond, capc, dens, coup, 12)
        return sim
    else:
        sim = Sim3T()
        for layer in safe_layers:
            length = layer["length"]
            dens = layer["rho"]
            cond = [eval(layer["K"][0]), eval(layer["K"][1]), eval(layer["K"][2])]
            capc = [eval(layer["C"][0]), eval(layer["C"][1]), eval(layer["C"][2])]
            coup = [eval(layer["G"][0]), eval(layer["G"][1]), eval(layer["G"][2])]
            sim.addLayer( length, cond, capc, dens, coup, 12)
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
        safe_layers[index]["G"][0] = input_control(layer["G"][0])
        if safe_layers[index]["G"][0] == -1: return index
        if flags["spin_temp"]:
            safe_layers[index]["C"][2] = input_control(layer["C"][2])
            if safe_layers[index]["C"][2] == -1: return index
            safe_layers[index]["K"][2] = input_control(layer["K"][2])
            if safe_layers[index]["K"][2] == -1: return index
            safe_layers[index]["G"][1] = input_control(layer["G"][1])
            if safe_layers[index]["G"][2] == -1: return index
            safe_layers[index]["G"][2] = input_control(layer["G"][2])
            if safe_layers[index]["G"][2] == -1: return index
    return safe_layers



def input_control(input):
    try:
        f = eval(input)
        return input
    except: pass
    try:
        if not flags["spin_temp"]:
            f = eval("lambda Te, Tl:" + input)
            dummy = f(array([1,2,3]), array([1,2,3]))
            return "lambda Te, Tl:" + input
        else:
            f = eval("lambda Te, Tl, Ts:" + input)
            dummy = f(array([1,2,3]), array([1,2,3]))
            return "lambda Te, Tl:" + input
    except: pass
    try:
        f = eval("lambda T:" + input)
        dummy = f(array([1,2,3]))
        return "lambda T:" + input
    except: pass
    return -1