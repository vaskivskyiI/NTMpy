import sys
sys.path.insert(0, './code')

from Sim2T import Sim2T # type: ignore
import Visual as vs # type: ignore
from Source import source # type: ignore
import numpy as np

# Case 3 ======================================================================

sim = Sim2T()
# Add Nichel
sim.addLayer( 50e-9,   [8, 0], [lambda Te, Tl: 91 * Te / Tl, lambda T: 1065*T/300], 6500, 3.6e17)
# Add Gold
sim.addLayer(100e-9, [24, 12], [lambda Te, Tl: 91 * Te / Tl, lambda T:   71*T/300], 5100, 2.1e16)


src = source()
src.setLaser(4,5e-12)
src.delay = 10e-12
src.absorption = [10e-9, 10e-9] 

sim.setSource(src)
sim.final_time = 1e-9

[x,t,phi] = sim.run()

vs.compare(x,t,phi[0], phi[1])
# =============================================================================
