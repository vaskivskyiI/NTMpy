import eel
import json, os
from gui.py.variables import layers, nindex, flags, layer_state, current_path, materialsDB


# Material properties interfaces #################
@eel.expose
def setLayers(layer, id = -1):

    if id < 0:
        layers.append(layer)
        nindex.append({"l": None, "nr": None, "ni": None})
        flags["layers_set"] = False
    else:
        layers[id] = layer

    if len(layers) > 1 and layers[-1]["length"] > 10 * sum([layer["length"] for layer in layers[:-1]]):
        flags["substrate"] = True
    else:
        flags["substrate"] = False
    flags["result_set"] = False

    

@eel.expose
def getLayers():
    return layers 

# Modify layers order 
@eel.expose
def move_layer(id1, id2):
    layers[id1], layers[id2] = layers[id2], layers[id1]
    nindex[id1], nindex[id2] = nindex[id2], nindex[id1]
    flags["result_set"] = False

@eel.expose
def duplicateLayer(id):
    layers.insert(id, layers[id].copy())
    nindex.insert(id, nindex[id].copy())
    flags["result_set"] = False

@eel.expose
def removeLayer(id):
    layers.pop(id)
    nindex.pop(id)
    if len(layers) < 2:
        flags["substrate"] = False
    if len(layers) < 1:
        flags["layers_set"] = False
    flags["result_set"] = False

@eel.expose
def checkLayers():
    layer_state.clear()
    almost_set = True
    for layer, refraction in zip(layers, nindex):
        if flags["reflection"]:
            props_s = not refraction["nr"] is None and not refraction["ni"] is None
        else:
            props_s = not refraction["l"] is None
        almost_set &= props_s
        if flags["spin_temp"]:
            props_h  = not layer["C"][2] is None and not layer["K"][2] is None
            props_h &= not layer["C"][2] is None and not layer["K"][2] is None
        else:
            props_h = True
        layer_state.append(props_s and props_h)
    flags["almost_set"] = almost_set
    flags["layers_set"] = all(layer_state) and len(layers) > 0
    return layer_state

@eel.expose
def saveMaterialToDB(name, material):
    base_filename = name.split(" ")[0].lower()
    
    existing_files = [f for f in os.listdir("./data/materials/") if f.startswith(base_filename) and f.endswith('.json')]
    
    counter = 0
    filename = f"{base_filename}00.json"
    while filename in existing_files:
        filename = f"{base_filename}{counter:02d}.json"
        counter += 1

    try:
        with open("./data/materials/" + filename, 'w') as f:
            json.dump(material, f, indent=4)
        return {"success": True, "message": "Success: Material " + material["id"] +" saved successfully"}
    except Exception as e:
        return {"success": False, "message": "Error saving material: " + str(e)}

@eel.expose
def getMaterialsDB():
    
    materials = []
    materialsDB.clear()
    num_temp = 3 if flags["spin_temp"] else 2
    for filename in os.listdir("./data/materials/"):
        material = json.load(open("./data/materials/" + filename, 'r'))
        if material["num_temp"] == num_temp:
            materialsDB[material["id"]] = filename
            materials.append(material["id"])
    return materials

@eel.expose
def loadMaterialFromDB(name):
    try:
        with open("./data/materials/" + materialsDB[name], 'r') as f:
            material = json.load(f)
        return {"success": True, "material": material}
    except Exception as e:
        return {"success": False, "message": "Error loading material: " + str(e)}

@eel.expose
def deleteMaterialFromDB(name):
    try:
        if name not in materialsDB:
            return {"success": False, "message": f"Material {name} not found in database"}
        
        os.remove("./data/materials/" + materialsDB[name])
        
        materialsDB.pop(name)
        
        return {"success": True, "message": f"Material {name} deleted successfully"}
    except Exception as e:
        return {"success": False, "message": f"Error deleting material: {str(e)}"}


