import sys
sys.path.insert(0, './code')
from Source import source # type: ignore
from numpy import array # type: ignore

global src; src = source()
global data; data = {"src": None}

global current_file; current_file = [""]

global layers; layers = []
global nindex; nindex = []

global laser; laser = {"energy": 0, "fwhm": 0, "delay": 0}

global flags; flags = { "reflection": False,
                        "source_set": False,
                        "layers_set": False,
                        "result_set": False}


global out; out = array([])


