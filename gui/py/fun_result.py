import eel
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

from gui.py.variables import out, current_data, flags, layers

# Plot Temperature in time ######################
@eel.expose
def getResultsTime(penetration = 0.0):
    if penetration > 0.0:
        penetration  = np.exp(-out["x"]/penetration)
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

    if flags["spin_temp"]:
        temp_spin = penetration @ out["T"][2] if np.any(penetration) > 0.0 else out["T"][2][0]
        temp_spin = np.interp(time, out["t"], temp_spin)
        return [[time[0], time[-1]], list(temp_electron), list(temp_lattice), list(temp_spin)]
    
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
    
    if not flags["substrate"]:
        equispaced = np.linspace(space[0], space[-1], 512)
    else:
        equispaced = np.linspace(0, 4/3 * np.sum([layer["length"] for layer in layers[:-1]]), 512)
        
    temp_electron = np.interp(equispaced, space, temp_electron)
    temp_lattice  = np.interp(equispaced, space, temp_lattice )

    if flags["spin_temp"]:
        temp_spin  = out["T"][2][:, int(np.floor(t_index))] * weight1
        temp_spin += out["T"][2][:, int(np.ceil( t_index))] * weight2
        temp_spin  = np.interp(equispaced, space, temp_spin)
        return [[space[0], space[-1]], list(temp_electron), list(temp_lattice), list(temp_spin)]

    if flags["substrate"]:
        space = [0, 4/3 * np.sum([layer["length"] for layer in layers[:-1]])]

    return [[space[0], space[-1]], list(temp_electron), list(temp_lattice)] 

# Get Max Temperature ###########################
@eel.expose
def getMaxTemperature():
    return max(np.max(out["T"][0]), np.max(out["T"][1]))

# Plot with matplotlib ##########################
@eel.expose
def plotPython(penetration = 0):
    if penetration > 0:
        penetration  = np.exp(-out["x"]/penetration)
        penetration *= np.append(np.diff(out["x"]), 0.0)
        penetration /= np.sum(penetration)
        temp_electron = penetration @ out["T"][0]
        temp_lattice  = penetration @ out["T"][1]
    else:
        temp_electron = out["T"][0][0]
        temp_lattice  = out["T"][1][0]
    plt.plot(out["t"]*1e12, temp_electron)
    plt.plot(out["t"]*1e12, temp_lattice)
    plt.grid()
    plt.xlim(out["t"][0]*1e12, out["t"][-1]*1e12)
    plt.ylim(300, (max(np.max(temp_electron), np.max(temp_lattice)) - 300) * 1.1 + 300) 
    legend = ["Electron temperature", "Lattice temperature"]

    if flags["spin_temp"]:
        temp_spin = penetration @ out["T"][2] if np.any(penetration) > 0 else out["T"][2][0]
        plt.plot(out["t"]*1e12, temp_spin)
        legend.append("Spin temperature")
    
    try:
        data = np.loadtxt(current_data[0], delimiter=",")
        def interpolant(x, a, b):
            return a * np.interp(x, out["t"], temp_electron) + b

        fit = curve_fit(interpolant, data[:,0], data[:,1])[0]

        data[:,1] -= fit[1]
        data[:,1] /= fit[0]

        data[:,0] *= 1e12

        plt.plot(data[:,0], data[:,1], "o")
        legend.append("Experimental data")
    except:
        pass

    plt.legend(legend)
    plt.xlabel("Time [ps]")
    plt.ylabel("Temperature [K]")
    plt.show()
    

# Read experimental data ########################
@eel.expose
def getExperimental(filename = "./data/", penetration = 0.0):
    try:
        data = np.loadtxt(filename, delimiter=",")
    except:
        return "Error: data not found or invalid format"

    if penetration > 0:
        penetration  = np.exp(-out["x"]/penetration)
        penetration *= np.append(np.diff(out["x"]), 0.0)
        penetration /= np.sum(penetration)
        temp_electron = penetration @ out["T"][0] - 300
    else:
        temp_electron = out["T"][0][0] - 300

    def interpolant(x, a, b):
        return a * np.interp(x, out["t"], temp_electron) + b

    fit = curve_fit(interpolant, data[:,0], data[:,1])[0]

    data[:,1] -= fit[1]
    data[:,1] /= fit[0]
    data[:,1] /= np.max(temp_electron)

    data[:,0] -= out["t"][0]
    data[:,0] /= out["t"][-1] - out["t"][0]


    current_data[0] = filename
    return [list(data[:,0]), list(data[:,1])]

    
@eel.expose
def getDataFilename():
    return current_data[0]