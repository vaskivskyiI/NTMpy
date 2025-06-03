from core.Source import source # type: ignore

global src; src = source()

global current_path; current_path = ["./data/"]
global current_file; current_file = [""]
global current_data; current_data = [""]

global layers; layers = []
global nindex; nindex = []

global laser; laser = { "energy":       None,
                        "fwhm":         None,
                        "delay":        None,
                        "wavelength":   None,
                        "angle":        None,
                        "polarization": None}

global flags; flags = { "spinS_temp": False,
                        "reflection": False,
                        "source_set": False,
                        "layers_set": False,
                        "result_set": False}


global time; time = {"simulation": 0, "computation": 0}
global out; out = {"x": None, "t": None, "T": None}


