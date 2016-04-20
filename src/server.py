#!/usr/bin/env python3

import sys, getopt

sys.path.append('.')
import RTIMU
import os.path
import time
import math
import gps3
import threading
import asyncio
import websockets

SETTINGS_FILE = "RTIMULib"
exitFlag = 0

#  computeHeight() - the conversion uses the formula:
#
#  h = (T0 / L0) * ((p / P0)**(-(R* * L0) / (g0 * M)) - 1)
#
#  where:
#  h  = height above sea level
#  T0 = standard temperature at sea level = 288.15
#  L0 = standard temperatur elapse rate = -0.0065
#  p  = measured pressure
#  P0 = static pressure = 1013.25
#  g0 = gravitational acceleration = 9.80665
#  M  = mloecular mass of earth's air = 0.0289644
#  R* = universal gas constant = 8.31432
#
#  Given the constants, this works out to:
#
#  h = 44330.8 * (1 - (p / P0)**0.190263)

def computeHeight(pressure):
  return 44330.8 * (1 - pow(pressure / 1013.25, 0.190263));


class IMUThread(threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    print("Using settings file " + SETTINGS_FILE + ".ini")
    if not os.path.exists(SETTINGS_FILE + ".ini"):
      print("Settings file does not exist, will be created")

    self.s = RTIMU.Settings(SETTINGS_FILE)
    self.imu = RTIMU.RTIMU(self.s)
    self.pressure = RTIMU.RTPressure(self.s)

    if (not self.imu.IMUInit()):
      print("IMU Init Failed")
      sys.exit(1)

    self.imu.setSlerpPower(0.02)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)

    if(not self.pressure.pressureInit()):
      print("Pressure sensor Init Failed")
      sys.exit(1)

    self.poll_interval = self.imu.IMUGetPollInterval()
    print("Recommended Poll Interval: %dmS\n" % self.poll_interval)

  def run(self):
    while True:
      if self.imu.IMURead():
        data = self.imu.getIMUData()
        (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = self.pressure.pressureRead()
        fusionPose = data["fusionPose"]
        json = '{"imu":[{"pressureValid": "%i", "pressure": "%d", "temperatureValid": "%i", "temperature": "%d", "pitch": "%d", "roll": "%d", "yaw": "%d"}]}' % (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"], math.degrees(fusionPose[0]), math.degrees(fusionPose[1]), math.degrees(fusionPose[2]))
        print(json)
        time.sleep(self.poll_interval*1.0/1000.0)


class GPSThread(threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.session = gps3.GPSDSocket(host='localhost')
    self.fix = gps3.Fix()

  def run(self):
    for new_data in self.session:
      if new_data:
        self.fix.refresh(new_data)
        try:
          lat =  self.fix.TPV["lat"]
          lon =  self.fix.TPV["lon"]
          alt =  self.fix.TPV["alt"]
          spd =  self.fix.TPV["speed"]
          hdg =  self.fix.TPV["track"]
          climb = self.fix.TPV['climb']
          json = '{"gps":[{"lat": "%s", "lon": "%s", "hdg": "%f", "climb": "%f", "alt": "%f", "spd": "%f"}]}' % (lat, lon, float(hdg), climb, alt, spd)
          print(json)
        except ValueError:
          pass


if __name__ == "__main__":
  print('aeroPi server')
  imuThread = IMUThread()
  imuThread.daemon = True
  gpsThread = GPSThread()
  gpsThread.daemon = True
  
  #imuThread.start()
  gpsThread.start()
  
  while True:
    time.sleep(1)

