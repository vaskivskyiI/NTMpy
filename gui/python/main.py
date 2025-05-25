import eel
from gui.python.variables import flags, laser, layers, nindex, sim, src


# Run Simulation #################################
@eel.expose
def run_simulation():
    src_init()
    build_material()



# Build Material ####################################
def build_material():
    for layer in layers:
        length = layer["length"]
        cond = [eval("lambda Te, Tl: " + layer["K"][0]), eval("lambda Te, Tl: " + layer["K"][1])]
        capc = [eval("lambda Te, Tl: " + layer["C"][0]), eval("lambda Te, Tl: " + layer["C"][1])]
        coup =  eval("lambda Te, Tl: " + layer["G"])
        dens = layer["rho"]
        sim.addLayer( length, cond, capc, dens, coup)


# Initialize Source #################################
def src_init():
    if not flags["source_set"] or True:
        src.angle = 0
        src.setLaser(float(laser["energy"]), float(laser["fwhm"]))
        src.absorption = [float(n["l"]) for n in nindex]
        src.delay = float(laser["delay"])
        src.thickness = [float(layer["length"]) for layer in layers]
