import eel
import numpy as np

from gui.py.variables import out

# Plot Temperature ##############################
@eel.expose
def getResults():
    time = np.linspace(out["t"][0], out["t"][-1], 512)
    temp_electron = np.interp(time, out["t"], out["T"][0][0])
    temp_lattice  = np.interp(time, out["t"], out["T"][1][0])
    print(np.min(out["T"]))
    return [[time[0], time[-1]], list(temp_electron), list(temp_lattice)]