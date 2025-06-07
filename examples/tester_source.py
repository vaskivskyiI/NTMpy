import sys
sys.path.insert(0, './core')

from Source import source # type: ignore
import numpy as np
import matplotlib.pyplot as plt

# Initialize source
s = source()  # default option, Gaussian pulse
s.setLaser(1, 1e-12)
s.delay = 2e-12  # time the maximum intensity hits

s.angle = 0 * np.pi / 180  # angle in radians
s.wavelength = 10e-9

s.refraction = [1 + .5j, 1 + .4j]
s.thickness = [30e-9, 10e-9]
s.absorption = [1e-8, 1e-8]

end = np.sum(s.thickness)
x = np.linspace(0, end, 20000)
t = np.linspace(0, 4e-12, 1000)

SL = s.create(x, t)
s.type_x = 'tmm'

s.polarization = 's'
STs = s.create(x, t)

print("Waves TE:")
print("k0 = " + str(s.k[0]))
print("k1 = " + str(s.k[1]))
print(np.abs(s.wave)**1)


s.polarization = 'p'
STp = s.create (x, t)

print("Waves TM:")
print("k0 = " + str(s.k[0]))
print("k1 = " + str(s.k[1]))
print(np.abs(s.wave)**1)


#plt.plot(x, SL[:, 0])
#plt.plot(x,STp[:, 0], x, STs[:,0])
#plt.grid()
#plt.show()

print("Total energy")

# plt.plot(t,np.cumsum(np.sum(SL,0))*t[1]*x[1])
print(np.sum(SL * t[1] * x[1]))
# plt.plot(t,np.cumsum(np.sum(STs,0))*t[1]*x[1])
print(np.sum(STs * t[1] * x[1]))
# plt.plot(t,np.cumsum(np.sum(STp,0))*t[1]*x[1])
print(np.sum(STp * t[1] * x[1]))
