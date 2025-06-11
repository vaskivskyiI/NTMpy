import eel

from gui.py.variables import flags, layers, time, src
from gui.py.main import build_material
from gui.py.fun_source import src_init
import numpy as np
from scipy.optimize import curve_fit
from copy import deepcopy as copy



def fitParam(fun, prop, value):
    mod_layers = copy(layers)

    values = [value]
    mod_layers[prop[0]][prop[1]][prop[2]] = fun.replace("X", str(value))

    sim = build_material(mod_layers)
    src_init()
    sim = build_material(layers)
    if flags["substrate"]: sim.substrate = True
    if isinstance(sim, int):
        return "Error: some material property is not valid (maybe layer " + str(sim+1) + ")"
    sim.setSource(src)
    sim.final_time = time["simulation"]
    x, t, phi = sim.run()

    def interpolant(x, a, b):
        return a * np.interp(x, t, phi[0]) + b

    #fit = curve_fit(interpolant, data[:,0], data[:,1])[0]