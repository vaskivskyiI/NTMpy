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
    flags["result_set"] = False
    check_layers()
    check_source()
    return [flags["source_set"], flags["layers_set"]]


# Laser source interface #########################
@eel.expose
def setSource(energy, fwhm, delay):
    flags["source_set"] = True
    flags["result_set"] = False
    laser["energy"] = energy
    laser["fwhm"]   = fwhm
    laser["delay"]  = delay

@eel.expose
def getSource():
    return laser

@eel.expose
def setWave(wavelength, angle, polarization):
    laser["wavelength"] = wavelength
    laser["angle"] = angle
    laser["polarization"] = polarization
    flags["result_set"] = False

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
    flags["result_set"] = False
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

def check_source():
    flags["source_set"] = True
    flags["source_set"] &= laser["energy"] is not None
    flags["source_set"] &= laser["fwhm"]   is not None
    flags["source_set"] &= laser["delay"]  is not None
    if flags["reflection"]:
        flags["source_set"] &= laser["wavelength"] is not None
        flags["source_set"] &= laser["angle"] is not None
        flags["source_set"] &= laser["polarization"] is not None
