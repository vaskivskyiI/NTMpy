import sys
sys.path.insert(0, './core')

from Source import source # type: ignore
import numpy as np
import matplotlib.pyplot as plt

# Initialize source
s = source()  # default option, Gaussian pulse
s.setLaser(1, 1e-12)
s.delay = 2e-12  # time the maximum intensity hits

s.angle = np.pi / 4
s.wavelength = 10e-9

s.refraction = [1 + 4j, 2j]
s.thickness = [10e-6, 20e-9]

s.refraction = [1.0433 + 3.0855j, 1.0454 + 3.2169j, 2.0150 + 2.8488j, 1.766]
s.thickness = [30e-9, 15e-9, 50e-9, 25e-9]

s.refraction = [1 + .1j, 1 + .1j]
s.thickness = [100e-9, 100e-9]
s.absorption = [1e-8, 1e-8]

end = np.sum(s.thickness)
x = np.linspace(0, end, 1000)
t = np.linspace(0, 4e-12, 2000)

SL = s.create(x, t)
s.type_x = 'tmm'

s.polarization = 's'
STs = s.create(x, t)

s.polarization = 'p'
STp = s.create (x, t)

plt.plot(x, SL[:, 0])
# plt.plot(x,SL[10,:],x,ST[10,:])
# plt.plot(x,STp[10,:],x,STs[10,:])

# plt.plot(t,np.cumsum(np.sum(SL,0))*t[1]*x[1])
print(np.sum(SL * t[1] * x[1]))
# plt.plot(t,np.cumsum(np.sum(STs,0))*t[1]*x[1])
print(np.sum(STs * t[1] * x[1]))
# plt.plot(t,np.cumsum(np.sum(STp,0))*t[1]*x[1])
print(np.sum(STp * t[1] * x[1]))
