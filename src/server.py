#!/usr/bin/env python3
import signal, sys
sys.path.append('.')
import time
import websockets
import asyncio
import threading
import os.path
import math
import RTIMU
import gps3

stopFlag = False


class GPSWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)

    self.session = gps3.GPSDSocket(host='localhost')
    self.fix = gps3.Fix()
    self.data = 0
    self.lastData = 0
    self.alt = 0

  def run(self):
    while not stopFlag:
      for new_data in self.session:
        if new_data:
          self.fix.refresh(new_data)
          try:
            lat = self.fix.TPV["lat"]
            lon = self.fix.TPV["lon"]
            vs  = float(self.fix.TPV['climb'])*196.85
            spd = float(self.fix.TPV["speed"])*3.6
            hdg = self.fix.TPV["track"] if spd > 2 else 0
            self.alt = float(self.fix.TPV["alt"])
            alt = self.alt*3.28084
            self.data = '{"lat": %s, "lon": %s, "hdg": %d, "vs": %d, "alt": %d, "spd": %d}' % (lat, lon, hdg, vs, self.alt, spd)
          except ValueError:
            pass

  def get(self):
    if self.lastData is not self.data:
      self.lastData = self.data
      return self.data

  def getAlt(self):
    return self.alt



class IMUWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)

    if not os.path.exists("RTIMULib.ini"):
      print("Settings file does not exist, will be created")

    self.s = RTIMU.Settings("RTIMULib")
    self.imu = RTIMU.RTIMU(self.s)
    self.pressure = RTIMU.RTPressure(self.s)

    if not self.imu.IMUInit():
      print("IMU Init Failed")
      sys.exit(1)

    if not self.pressure.pressureInit():
      print("Pressure sensor Init Failed")
      sys.exit(1)

    self.imu.setSlerpPower(0.02)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)
    self.poll_interval = self.imu.IMUGetPollInterval()
    self.data = 0
    self.lastData = 0

  def run(self):
    while not stopFlag:
      if self.imu.IMURead():
        data = self.imu.getIMUData()
        fusionPose = data["fusionPose"]
        (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = self.pressure.pressureRead()

        alt = gpsWorker.getAlt()
        if alt >= 914.4: #surface S above 3000ft
          pressure = 1013.25
        else:
          if data["pressureValid"]:
            if type(alt) is float:
              r = 1.0 - (alt/44330.0)
              pressure = data["pressure"] / math.pow(r, 5.255)
            else:
              pressure = 0
          else:
            pressure = 0

        temperature = data["temperature"] if data["temperatureValid"] else 0
        pitch = self.toDeg(fusionPose[0])
        bank  = self.toDeg(fusionPose[1])
        yaw   = self.toDeg(fusionPose[2])

        self.data = '{"pressure": %d, "temperature": %.1f, "pitch": %.1f, "bank": %.1f, "yaw": %.1f}' % (pressure, temperature, pitch, bank, yaw)
        time.sleep(self.poll_interval*0.0001)

  def toDeg(self, number):
    v = math.degrees(number)
    v = '%.1f' % v
    v = round(float(v) * 2) / 2
    return v

  def get(self):
    if self.lastData is not self.data:
      self.lastData = self.data
      return self.data



class MSGWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.connected = set()

  def run(self):
    while not stopFlag:
      data = gpsWorker.get()
      if data:
        self.sendData('{"GPS": %s}' % data)

      data = imuWorker.get()
      if data:
        self.sendData('{"IMU": %s}' % data)

      time.sleep(0.02)

  async def handler(self, websocket, path):
    self.connected.add(websocket)
    try:
      await websocket.recv()
    except websockets.exceptions.ConnectionClosed:
      pass
    finally:
      self.connected.remove(websocket)

  def sendData(self, data):
    for websocket in self.connected.copy():
      coro = websocket.send(data)
      future = asyncio.run_coroutine_threadsafe(coro, loop)



if __name__ == "__main__":
  print('aeroPi server')
  gpsWorker = GPSWorker()
  imuWorker = IMUWorker()
  msgWorker = MSGWorker()

  try:
    gpsWorker.start()
    imuWorker.start()
    msgWorker.start()

    ws_server = websockets.serve(msgWorker.handler, '0.0.0.0', 7700)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(ws_server)
    loop.run_forever()
  except KeyboardInterrupt:
    stopFlag = True
    ws_server.close()
    loop.stop()
    print("Exiting program...")


