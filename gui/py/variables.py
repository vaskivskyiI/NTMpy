from core.Source import source # type: ignore

global src; src = source()

global current_path; current_path = [""]
global current_file; current_file = [""]
global current_data; current_data = [""]
global outdir; outdir = [""]

global layers; layers = []
global nindex; nindex = []

global laser; laser = { "energy":       None,
                        "fwhm":         None,
                        "delay":        None,
                        "wavelength":   None,
                        "angle":        None,
                        "polarization": None}

global flags; flags = { "spin_temp" : False,
                        "reflection":  True,
                        "substrate" : False,
                        "source_set": False,
                        "almost_set": False,
                        "layers_set": False,
                        "result_set": False}

global layer_state; layer_state = []

global time; time = {"simulation": 0, "computation": 0}
global out; out = {"x": None, "t": None, "T": None}

global materialsDB; materialsDB = {}

global fit; fit = { "point"   : [],
                    "value"   : [],
                    "coeff"   : [],
                    "target"  : [],
                    "function": None,
                    "weight"  : None,
                    "data"    : None,
                    "init"    : False}

global mod_layers; mod_layers = []



