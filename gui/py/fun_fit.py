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
        mod_layers.extend(copy(layers))

        fit["target"].extend(target) 
        
        fit["function"] = fun
        fit["point"].append(0.95*value)
        fit["point"].append(1.05*value)
    
        src_init()
        sim = build_material(mod_layers, 15)
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

    
        try:
            fit["data"] = np.loadtxt(path, delimiter=",")
        except:
            fit["init"] = True
            return {"success": False, "message": "Error: could not load data file."}
        


        out = fit_eval(fit["point"][0])
        fit["value"].append(out[1])
        out = fit_eval(fit["point"][1])
        fit["value"].append(out[1])

        fit["init"] = True
        return {"success":True}
    else:
        return {"success": False, "message": "Error: fit already initialized."}


@eel.expose
def fitRun():
    best  = 0 if fit["value"][0] <= fit["value"][1] else 1
    worst = 1 if fit["value"][0] <= fit["value"][1] else 0

    Fbst = fit["value"][best]
    Fwst = fit["value"][worst]
    
    Xctr = fit["point"][best]
    Xref = Xctr + 1*(Xctr - fit["point"][worst])
    out_ref = fit_eval(Xref)
    Fref = out_ref[1]

    if Fref < Fbst:
        Xexp  = Xctr + 2*(Xref - Xctr)
        out_exp = fit_eval(Xexp)
        Fexp = out_exp[1]

        if Fexp < Fref:
            fit["point"][worst] = Xexp
            fit["value"][worst] = Fexp
            fit["coeff"] = out_exp[0]
            plot = prepare_plot(out_exp[2], out_exp[3], out_exp[0])
            return {"success": True, "value": Fref, "point": Xexp, "plot": plot}
        else:
            fit["point"][worst] = Xref
            fit["value"][worst] = Fref
            fit["coeff"] = out_ref[0]
            plot = prepare_plot(out_ref[2], out_ref[3], out_ref[0])
            return {"success": True, "value": Fref, "point": Xref, "plot": plot}
    
    elif Fref < Fwst:
        Xcon = Xctr + 0.5*(Xref - Xctr)
        out_con = fit_eval(Xcon)
        Fcon = out_con[1]

        if Fcon < Fref:
            fit["point"][worst] = Xcon
            fit["value"][worst] = Fcon
            fit["coeff"] = out_con[0]
            plot = prepare_plot(out_con[2], out_con[3], out_con[0])
            return {"success": True, "value": Fcon, "point": Xcon, "plot": plot}

    elif Fref >= Fwst:
        Xcon = Xctr + 0.5*(fit["point"][worst] - Xctr)
        out_con = fit_eval(Xcon)
        Fcon = out_con[1]
        if Fcon < Fwst:
            fit["point"][worst] = Xcon
            fit["value"][worst] = Fcon
            fit["coeff"] = out_con[0]
            plot = prepare_plot(out_con[2], out_con[3], out_con[0])
            return {"success": True, "value": Fcon, "point": Xcon, "plot": plot}

    Xsrk = fit["point"][best] + 0.5*(fit["point"][worst] - fit["point"][best])
    out_srk = fit_eval(Xsrk)
    Fsrk = out_srk[1]
    fit["point"][worst] = Xsrk
    plot = prepare_plot(out_srk[2], out_srk[3], out_srk[0])
    return {"success": True, "value": Fsrk, "point": Xsrk, "plot": plot}
   

def prepare_plot(time, value, coeff):
    data = []
    data.append(list(np.linspace(time[0], time[-1], 1000)))
    data.append(list(np.interp(data[0], time, value)))
    data.append(list(fit["data"][:,0]))
    data.append(list(fit["data"][:,1]/ coeff[0] + coeff[1]))
    return data


def fit_eval(value):
    mod_layers[fit["target"][0]][fit["target"][1]][fit["target"][2]] =  fit["function"].replace("X", str(value))

    src_init()
    sim = build_material(mod_layers, 10)
    sim.setSource(src)
    if flags["substrate"]: sim.substrate = True
    sim.final_time = time["simulation"]
    sim.log = False
    x, t, phi =  sim.run()

    temp = fit["weight"] @ phi[0]

    def interpolant(x, a, b):
        return a * (np.interp(x, t, temp) - b) 

    coeff = curve_fit(interpolant, fit["data"][:,0], fit["data"][:,1])[0]
    residue = np.sum((np.interp(fit["data"][:,0], t, temp) - fit["data"][:,1]/coeff[0] - coeff[1])**2)
    residue /= fit["data"].size

    print("Fit value: ", residue, " for X = ", value)

    return coeff, residue, t, temp

