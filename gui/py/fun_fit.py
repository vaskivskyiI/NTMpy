import eel

from gui.py.variables import fit, mod_layers, flags, layers, time, src
from gui.py.main import build_material
from gui.py.fun_source import src_init
import numpy as np
from scipy.optimize import curve_fit
from copy import deepcopy as copy

    

@eel.expose
def fitSetup(fun, target, value, depth, path):
    if not fit["init"]:
        fit["init"] = True
        mod_layers.extend(copy(layers))

        fit["target"].extend(target) 
        print("Target: ", fit["target"])
        
        fit["function"] = fun
        fit["point"].append(0.95*value)
        fit["point"].append(1.05*value)
    
        src_init()
        print(mod_layers)
        sim = build_material(mod_layers, 10)
        sim.setSource(src)
        if flags["substrate"]: sim.substrate = True
        sim.final_time = 2
        x, t, phi =  sim.run()
    
        if depth > 0:
            penetration  = np.exp(-x/depth)
            penetration *= np.append(np.diff(x), 0.0)
            penetration /= np.sum(penetration)
            fit["weight"] = penetration
        else:
            fit["weight"] = np.zeros_like(x)
            fit["weight"][0] = 1.0

    
        try:
            fit["data"] = np.loadtxt(path, delimiter=",")
        except:
            fit["init"] = True
            return {"success": False, "message": "Error: could not load data file."}
        


        out = fit_eval(fit["point"][0])
        fit["coeff"].append(out[0])
        fit["value"].append(out[1])
        out = fit_eval(fit["point"][1])
        fit["coeff"].append(out[0])
        fit["value"].append(out[1])

        return {"success":True}
    else:
        return {"success":False}


@eel.expose
def fitRun():
    best  = fit["point"][0] if fit["value"][0] < fit["value"][1] else fit["point"][1]
    worst = fit["point"][1] if fit["value"][0] < fit["value"][1] else fit["point"][0]
    centroid  = (best + worst) / 2.0
    reflected = best + 0.5*(best - worst)



def fit_eval(value):
    mod_layers[fit["target"][0]][fit["target"][1]][fit["target"][2]] =  fit["function"].replace("X", str(value))

    src_init()
    sim = build_material(mod_layers, 10)
    sim.setSource(src)
    if flags["substrate"]: sim.substrate = True
    sim.final_time = time["simulation"]
    x, t, phi =  sim.run()

    temp = fit["weight"] @ phi[0]

    def interpolant(x, a, b):
        return a * np.interp(x, t, temp) + b 

    return curve_fit(interpolant, fit["data"][:,0], fit["data"][:,1])

