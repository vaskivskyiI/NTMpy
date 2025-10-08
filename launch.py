import eel

import gui.py.variables # type: ignore
import gui.py.fun_material # type: ignore
import gui.py.fun_source # type: ignore
import gui.py.fun_files # type: ignore
import gui.py.fun_result # type: ignore
import gui.py.fun_fit # type: ignore
import gui.py.main # type: ignore

print("============================================================================================================")
print("Welcome to NTMpy GUI")
print("============================================================================================================")
print("This software was developed by Valentino Scalera and Lukas Alber with the collaboration of the SU-UDCM Group")
print("Please, report any bug or feature request to valentino.scalera@uniparthenope.it")
print("The graphical user interface is starting, please wait\n")


eel.init('.', allowed_extensions=['.js', '.html', '.css'])
eel.start('gui/html/page_main.html', size=(1000, 800), jinja_templates='gui/html', host='localhost', port=8000)    # Start

