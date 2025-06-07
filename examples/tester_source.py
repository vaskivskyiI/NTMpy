import sys
sys.path.insert(0, './core')

from Source import source # type: ignore
import numpy as np
import matplotlib.pyplot as plt

# Initialize source
s = source()  # default option, Gaussian pulse
s.setLaser(1, 1e-12)
s.delay = 2e-12  # time the maximum intensity hits

s.angle = 30 * np.pi / 180  # angle in radians
s.wavelength = 100e-9

s.refraction = [1.2 + 1.5j, 1 + .4j]
s.thickness = [50e-9, 50e-9]
s.absorption = [1e-8, 1e-8]

end = np.sum(s.thickness)
x = np.linspace(0, end, 20000)
t = np.linspace(0, 4e-12, 1000)

SL = s.create(x, t)
print("\nLambert-Beer")
print("energy absorbed: " + str(np.sum(SL * t[1] * x[1])))

s.type_x = 'tmm'

s.polarization = 's'
STs = s.create(x, t)

print("\nTransfer Matrix Method - S polarization")
print("energy absorbed:      " + str(np.sum(STs * t[1] * x[1])))
print("energy not reflected: " + str((1-np.abs(s.wave[0][1])**2) * np.cos(s.angle)))


s.polarization = 'p'
STp = s.create (x, t)

print("\nTransfer Matrix Method - P polarization")
print("energy absorbed:      " + str(np.sum(STp * t[1] * x[1])))
print("energy not reflected: " + str((1-np.abs(s.wave[0][1])**2) * np.cos(s.angle)))

print("\n")


