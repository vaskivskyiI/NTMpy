import eel

import gui.py.variables # type: ignore
import gui.py.fun_material # type: ignore
import gui.py.fun_source # type: ignore
import gui.py.fun_files # type: ignore
import gui.py.fun_result # type: ignore
import gui.py.main # type: ignore



eel.init('.', allowed_extensions=['.js', '.html', '.css'])
eel.start('gui/html/page_main.html', size=(1000, 800), jinja_templates='gui/html')    # Start

