import eel
import numpy as np

from gui.py.variables import out

# Plot Temperature in time ######################
@eel.expose
def getResultsTime():
    time = np.linspace(out["t"][0], out["t"][-1], 512)
    temp_electron = np.interp(time, out["t"], out["T"][0][0])
    temp_lattice  = np.interp(time, out["t"], out["T"][1][0])
    return [[time[0], time[-1]], list(temp_electron), list(temp_lattice)]


# Plot Temperature in space #####################
@eel.expose
def getResultsSpace(time):
    space = out["x"]
    temp_electron = [np.interp(time, out["t"], out["T"][0][x]) for x in range(len(space))]
    temp_lattice  = [np.interp(time, out["t"], out["T"][1][x]) for x in range(len(space))]
    return [[space[0], space[-1]], list(temp_electron), list(temp_lattice)] 

# Get Max Temperature ###########################
@eel.expose
def getMaxTemperature():
    return max(np.max(out["T"][0]), np.max(out["T"][1]))