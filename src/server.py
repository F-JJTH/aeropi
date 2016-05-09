#!/usr/bin/env python3
import signal, sys
sys.path.append('.')
import RTIMU
import os.path
import time
import math
import gps3
import websockets
import asyncio
import threading

ALTITUDE = 0
PRESSURE = 0


class GPSWebSocket(threading.Thread):    
  @asyncio.coroutine
  def handler(self, websocket, path):
    global ALTITUDE
    for new_data in self.session:
      if new_data:
        self.fix.refresh(new_data)
        try:
          lat =  self.fix.TPV["lat"]
          lon =  self.fix.TPV["lon"]
          alt =  self.fix.TPV["alt"]
          ALTITUDE = alt
          spd =  self.fix.TPV["speed"]
          hdg = 0
          if int(spd) > 2:
            hdg =  self.fix.TPV["track"]
          vs = self.fix.TPV['climb']
          stream = '{"lat": %s, "lon": %s, "hdg": %d, "vs": %d, "alt": %.1f, "spd": %d}'\
                   % (lat, lon, int(hdg), vs*3.28084, alt*3.28084, spd*3.6)
          yield from websocket.send(stream)
        except ValueError:
          pass

  def run(self):
    self.session = gps3.GPSDSocket(host='localhost')
    self.fix = gps3.Fix()
    
    start_server = websockets.serve(self.handler, '0.0.0.0', 7001)
    eventloop = asyncio.new_event_loop()
    asyncio.set_event_loop(eventloop)
    eventloop.run_until_complete(start_server)
    eventloop.run_forever()



class IMUWebSocket(threading.Thread):    
  @asyncio.coroutine
  def handler(self, websocket, path):
    global PRESSURE
    lastStream = 0
    while True:
      if self.imu.IMURead():
        data = self.imu.getIMUData()
        fusionPose = data["fusionPose"]
        (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = self.pressure.pressureRead()
        
        if type(ALTITUDE) is float:
          PRESSURE = data["pressure"] / math.pow(1.0 - (ALTITUDE/44330.0), 5.255);
        
        temperature = 0
        if data["temperatureValid"]:
          temperature = data["temperature"]

        stream = '{"altMb": %d, "temperature": %.1f, "pitch": %d, "bank": %d, "yaw": %d}'\
                  % (PRESSURE, temperature, math.degrees(fusionPose[0])-166, math.degrees(fusionPose[1]), math.degrees(fusionPose[2]))

        if stream != lastStream:
          yield from websocket.send(stream)

        lastStream = stream
        time.sleep(self.poll_interval*0.0001)

  def run(self):
    if not os.path.exists("RTIMULib.ini"):
      print("Settings file does not exist, will be created")

    self.s = RTIMU.Settings("RTIMULib")
    self.imu = RTIMU.RTIMU(self.s)
    self.pressure = RTIMU.RTPressure(self.s)

    if (not self.imu.IMUInit()):
      print("IMU Init Failed")
      sys.exit(1)

    if(not self.pressure.pressureInit()):
      print("Pressure sensor Init Failed")
      sys.exit(1)

    self.imu.setSlerpPower(0.02)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)
    self.poll_interval = self.imu.IMUGetPollInterval()
    
    start_server = websockets.serve(self.handler, '0.0.0.0', 7000)
    eventloop = asyncio.new_event_loop()
    asyncio.set_event_loop(eventloop)
    eventloop.run_until_complete(start_server)
    eventloop.run_forever()



if __name__ == "__main__":
  print('aeroPi server')
  gpsWS = GPSWebSocket()
  imuWS = IMUWebSocket()
  gpsWS.start()
  imuWS.start()
  

