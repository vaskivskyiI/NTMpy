import eel
import numpy as np
import matplotlib.pyplot as plt

from gui.py.variables import out, current_data

# Plot Temperature in time ######################
@eel.expose
def getResultsTime(penetration_depth = 0.0):
    if penetration_depth > 0.0:
        penetration  = np.exp(-out["x"]/penetration_depth)
        penetration *= np.append(np.diff(out["x"]), 0.0)
        penetration /= np.sum(penetration)
        temp_electron = penetration @ out["T"][0]
        temp_lattice  = penetration @ out["T"][1]
    else:
        temp_electron = out["T"][0][0]
        temp_lattice  = out["T"][1][0]
    time = np.linspace(out["t"][0], out["t"][-1], 512)
    temp_electron = np.interp(time, out["t"], temp_electron)
    temp_lattice  = np.interp(time, out["t"], temp_lattice)
    return [[time[0], time[-1]], list(temp_electron), list(temp_lattice)]


# Plot Temperature in space #####################
@eel.expose
def getResultsSpace(time):
    space = out["x"]
    t_index = np.interp(time, out["t"], np.arange(out["t"].size))
    weight1 = np.ceil(t_index) - t_index 
    weight2 = 1 - weight1
    temp_electron  = out["T"][0][:, int(np.floor(t_index))] * weight1
    temp_electron += out["T"][0][:, int(np.ceil( t_index))] * weight2
    temp_lattice   = out["T"][1][:, int(np.floor(t_index))] * weight1
    temp_lattice  += out["T"][1][:, int(np.ceil( t_index))] * weight2
    #temp_electron = [np.interp(time, out["t"], out["T"][0][x]) for x in range(len(space))]
    #temp_lattice  = [np.interp(time, out["t"], out["T"][1][x]) for x in range(len(space))]
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
    plt.legend(["Electron temperature", "Lattice temperature"])
    plt.xlabel("Time [ns]")
    plt.ylabel("Temperature [K]")
    plt.show()

# Read experimental data ########################
@eel.expose
def getExperimental(filename = "./data/"):
    try:
        data = np.loadtxt(filename, delimiter=",")
        data[:,0] /= out["t"][-1]
        data[:,1] -= data[0,1]
        ratio = (out["T"][0][0][-1]-300) / (np.max(out["T"][0][0])-300)
        data[:,1] *= ratio / data[-1][-1]
        current_data[0] = filename
        return [list(data[:,0]), list(data[:,1])]
    except:
        return "Error: data not found or invalid format"
    
@eel.expose
def getDataFilename():
    return current_data[0]