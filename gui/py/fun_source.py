import eel
import numpy as np

from gui.py.variables import flags, laser, layers, nindex, src
from main import src_init

# Flags interfaces ###############################
@eel.expose
def setFlags(id, prop): 
    flags[id] = prop

@eel.expose
def getFlags(id):
    return flags[id]

@eel.expose
def setReflection(reflection):
    flags["reflection"] = reflection
    check_layers()
    return flags["layers_set"]


# Laser source interface #########################
@eel.expose
def setSource(energy, fwhm, delay):
    flags["source_set"] = True
    laser["energy"] = energy
    laser["fwhm"]   = fwhm
    laser["delay"]  = delay

@eel.expose
def getSource():
    return laser

@eel.expose
def setWavelength(wavelength, angle):
    laser["wavelength"] = wavelength
    laser["angle"] = angle

# Plotting source ################################
@eel.expose
def plot_src_x():
    src_init()
    total_leng = np.sum([ layer["length"] for layer in layers])
    if flags["reflection"]:
        array = src.transfer_matrix(np.linspace(0,total_leng, 512))
    else:
        array = src.lambert_beer(np.linspace(0,total_leng, 512))
    return [float(x) for x in array]
    

@eel.expose
def plot_src_t():
    src_init()
    total_time = 2*laser["fwhm"] + laser["delay"]
    array = src.gaussian(np.linspace(0, total_time, 512))
    return [float(x) for x in array]

# Absorption / Refraction interface ##############
@eel.expose
def setIndexN( nr, ni, id):
    if flags["reflection"]:
        nindex[id-1]["nr"] = nr
        nindex[id-1]["ni"] = ni
    else:
        nindex[id-1]["l"] = nr
    check_layers()
    return flags["layers_set"]

@eel.expose
def getIndexN():
    return nindex


def check_layers():
    if flags["reflection"]:
        flags["layers_set"]  = not any(element["nr"] is None for element in nindex)
        flags["layers_set"] &= not any(element["ni"] is None for element in nindex)
    else:
        flags["layers_set"] = not any(element["l"] is None for element in nindex)
    flags["layers_set"] &= len(layers) > 0