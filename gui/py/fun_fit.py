import eel

from gui.py.variables import fit, mod_layers, flags, layers, time, src, store
from gui.py.main import build_material, input_control
from gui.py.fun_source import src_init
import numpy as np
from scipy.optimize import curve_fit
from copy import deepcopy as copy

    

@eel.expose
def fitSetup(fun, target, value, depth, path):
    if not fit["init"]:

        if   target[0] < 0: return {"success": False, "message": "Error: No layer selected"}
        if len(target) < 3: return {"success": False, "message": "Error: No property selected"}

        try:
            fit["data"] = np.loadtxt(path, delimiter=",")
        except:
            return {"success": False, "message": "Error: could not load data file."}

        try:
            if not isinstance(eval(value), (int, float)):
                return {"success": False, "message": "Error: initial value not evaluable"}
        except:
            return {"success": False, "message": "Error: initial value not evaluable"}

        if input_control(fun.replace("X", str(value))) == -1:
            return {"success": False, "message": "Error: expression not evaluable"}

        value = eval(value)

        fit["point"].clear()
        fit["value"].clear()
        mod_layers.clear()
        mod_layers.extend(copy(layers))

        fit["target"].clear()
        fit["target"].extend(target) 
        
        fit["function"] = fun
        fit["point"].clear()
        fit["point"].append(0.8*value)
        fit["point"].append(1.2*value)
    
        src_init()
        sim = build_material(mod_layers, 12)
        sim.setSource(src)
        if flags["substrate"]: sim.substrate = True
        sim.final_time = 2
        sim.log = False
        x, t, phi =  sim.run()
    
        if depth > 0:
            penetration  = np.exp(-x/depth)
            penetration *= np.append(np.diff(x), 0.0)
            penetration /= np.sum(penetration)
            fit["weight"] = penetration
        else:
            fit["weight"] = np.zeros_like(x)
            fit["weight"][0] = 1.0

        out = fit_eval(fit["point"][0])
        fit["value"].append(out[1])
        out = fit_eval(fit["point"][1])
        fit["value"].append(out[1])

        fit["init"] = True
        return {"success":True, "message": "Fit initialized"}
    else:
        return {"success": True, "message": "Fit already initialized."}


@eel.expose
def fitRun():
    best  = 0 if fit["value"][0] <= fit["value"][1] else 1
    worst = 1 if fit["value"][0] <= fit["value"][1] else 0

    Fbst = fit["value"][best]
    Fwst = fit["value"][worst]
    
    Xctr = fit["point"][best]
    Xref = max(Xctr + 1*(Xctr - fit["point"][worst]), 0)
    out_ref = fit_eval(Xref)
    Fref = out_ref[1]

    if Fref < Fbst:
        Xexp  = max(Xctr + 2*(Xref - Xctr), 0)
        out_exp = fit_eval(Xexp)
        Fexp = out_exp[1]

        if Fexp < Fref:
            fit["point"][worst] = Xexp
            fit["value"][worst] = Fexp
            fit["coeff"] = out_exp[0]
            prepare_plot(out_exp[2], out_exp[3], out_exp[0], Fexp)
            return {"success": True, "value": Fref, "point": Xexp}
        else:
            fit["point"][worst] = Xref
            fit["value"][worst] = Fref
            fit["coeff"] = out_ref[0]
            prepare_plot(out_ref[2], out_ref[3], out_ref[0], Fref)
            return {"success": True, "value": Fref, "point": Xref}
    
    elif Fref < Fwst:
        Xcon = max(Xctr + 0.5*(Xref - Xctr), 0)
        out_con = fit_eval(Xcon)
        Fcon = out_con[1]

        if Fcon < Fref:
            fit["point"][worst] = Xcon
            fit["value"][worst] = Fcon
            fit["coeff"] = out_con[0]
            prepare_plot(out_con[2], out_con[3], out_con[0], Fcon)
            return {"success": True, "value": Fcon, "point": Xcon}

    elif Fref >= Fwst:
        Xcon = max(Xctr + 0.5*(fit["point"][worst] - Xctr), 0)
        out_con = fit_eval(Xcon)
        Fcon = out_con[1]
        if Fcon < Fwst:
            fit["point"][worst] = Xcon
            fit["value"][worst] = Fcon
            fit["coeff"] = out_con[0]
            prepare_plot(out_con[2], out_con[3], out_con[0], Fcon)
            return {"success": True, "value": Fcon, "point": Xcon}

    Xsrk = max(fit["point"][best] + 0.5*(fit["point"][worst] - fit["point"][best]), 0)
    out_srk = fit_eval(Xsrk)
    Fsrk = out_srk[1]
    fit["point"][worst] = Xsrk
    prepare_plot(out_srk[2], out_srk[3], out_srk[0], Fsrk)
    return {"success": True, "value": Fsrk, "point": Xsrk}
   
@eel.expose
def getFitPlots():
    return store

@eel.expose
def getFitValue():
    return float(fit["point"][-1])

def prepare_plot(time, value, coeff, residue):

    store["time_sim"] = list(np.linspace(time[0], time[-1], 1000))
    store["temp_sim"] = list(np.interp(store["time_sim"], time, value))
    store["time_exp"] = list(fit["data"][:,0])
    store["temp_exp"] = list(fit["data"][:,1]/ coeff[0] + coeff[1])
    store["residual"].append(residue)


def fit_eval(value):
    mod_layers[fit["target"][0]][fit["target"][1]][fit["target"][2]] =  fit["function"].replace("X", str(value))

    src_init()
    sim = build_material(mod_layers, 12)
    sim.setSource(src)
    if flags["substrate"]: sim.substrate = True
    sim.final_time = time["simulation"]
    sim.log = False
    x, t, phi =  sim.run()

    temp = fit["weight"] @ phi[0]

    def interpolant(x, a, b):
        return a * (np.interp(x, t, temp) - b) 

    coeff = curve_fit(interpolant, fit["data"][:,0], fit["data"][:,1], p0 = [5,300], maxfev=5000)[0]
    residue = np.sum((np.interp(fit["data"][:,0], t, temp) - fit["data"][:,1]/coeff[0] - coeff[1])**2)
    residue /= fit["data"].size
    residue /= (np.max(temp) - np.min(temp))**2
    print(f"Residue value: {residue:1.4e} for X = {value:1.4e}  -  simulation time: {sim.computation_time:1.5f}")

    return coeff, residue, t, temp

@eel.expose
def applyFitted():
    layers.clear()
    layers.extend(copy(mod_layers))

@eel.expose
def getFitData():
    if fit["init"]:
        return {"init": True, "target": fit["target"], "function": fit["function"]}
    else:
        return {"init": False}
    
@eel.expose
def resetFit():
    if (fit["init"]): print("Fit reset")
    mod_layers.clear()
    store["residual"].clear()
    fit["init"] = False
    