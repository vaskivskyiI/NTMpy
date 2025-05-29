import eel
import numpy as np
import matplotlib.pyplot as plt

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
    equispaced = np.linspace(space[0], space[-1], 512)
    temp_electron = np.interp(equispaced, space, temp_electron)
    temp_lattice  = np.interp(equispaced, space, temp_lattice )
    return [[space[0], space[-1]], list(temp_electron), list(temp_lattice)] 

# Get Max Temperature ###########################
@eel.expose
def getMaxTemperature():
    return max(np.max(out["T"][0]), np.max(out["T"][1]))

# Plot with matplotlib ##########################
@eel.expose
def plotPython():
    plt.plot(out["t"]*1e9, out["T"][0][0])
    plt.plot(out["t"]*1e9, out["T"][1][0])
    plt.grid()
    plt.xlim(out["t"][0]*1e9, out["t"][-1]*1e9)
    plt.ylim(300, (max(np.max(out["T"][0][0]),np.max(out["T"][1][0])) - 300) * 1.1 + 300) 
    plt.legend(["Electron Temperature", "Lattice temperature"])
    plt.xlabel("Time [ns]")
    plt.ylabel("Temperature [K]")
    plt.show()

# Read experimental data ########################
@eel.expose
def getExperimental():
    data = np.loadtxt("data/expdata.csv", delimiter=",")
    return [list(data[:,0]), list(data[:,1])]