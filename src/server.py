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



class GPSWebSocket(threading.Thread):    
  @asyncio.coroutine
  def handler(self, websocket, path):
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
          stream = '{"gps":[{"lat": "%s", "lon": "%s", "hdg": "%f", "climb": "%f", "alt": "%f", "spd": "%f"}]}'\
                   % (lat, lon, float(hdg), climb, alt, spd)
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
    while True:
      if self.imu.IMURead():
        data = self.imu.getIMUData()
        (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = self.pressure.pressureRead()
        fusionPose = data["fusionPose"]
        stream = '{"imu":[{"pressureValid": "%i", "pressure": "%d", "temperatureValid": "%i", "temperature": "%d", "pitch": "%d", "roll": "%d", "yaw": "%d"}]}'\
                  % (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"],\
                  math.degrees(fusionPose[0]), math.degrees(fusionPose[1]), math.degrees(fusionPose[2]))
        yield from websocket.send(stream)
        time.sleep(self.poll_interval*1.0/1000.0)

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
  

