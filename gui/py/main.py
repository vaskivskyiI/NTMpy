import sys
import eel

sys.path.insert(0, './code')
from Sim2T import Sim2T # type: ignore
from Source import source # type: ignore
from numpy import array, savez # type: ignore

from gui.py.variables import flags, laser, layers, nindex, src, out, time, current_file


# Run Simulation #################################
@eel.expose
def run_simulation(final_time):
    time["simulation"] = final_time
    src_init()
    sim = build_material()
    sim.setSource(src)
    sim.final_time = float(final_time)
    [out["x"], out["t"], out["T"]] = sim.run()
    filename = "./data/" + current_file[0].split(".")[:-1][0]
    savez(filename, x = out["x"], t=out["t"], Te=out["T"][0], Tl=out["T"][1])
    
    #with load('foo.npz') as data:
    #a = data['a']

    time["computation"] = sim.computation_time
    flags["result_set"] = True
    

# Build Material ####################################
def build_material():
    sim = Sim2T()
    for layer in layers:
        length = layer["length"]
        cond = [eval(layer["K"][0]), eval(layer["K"][1])]
        capc = [eval(layer["C"][0]), eval(layer["C"][1])]
        print(layer["G"])
        coup =  eval(layer["G"])
        dens = layer["rho"]
        sim.addLayer( length, cond, capc, dens, coup)
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