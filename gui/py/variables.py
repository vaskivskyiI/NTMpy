import sys
sys.path.insert(0, './code')
from Source import source # type: ignore
from numpy import array # type: ignore

global src; src = source()

global current_file; current_file = [""]

global layers; layers = []
global nindex; nindex = []

global laser; laser = { "energy":       None,
                        "fwhm":         None,
                        "delay":        None,
                        "wavelength":   None,
                        "angle":        None,
                        "polarization": None}

global flags; flags = { "reflection": False,
                        "source_set": False,
                        "layers_set": False,
                        "result_set": False}


global out; out = array([])


