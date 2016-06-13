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
import json

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
            time = self.fix.TPV["time"]
            lat = self.fix.TPV["lat"]
            lon = self.fix.TPV["lon"]
            vs  = float(self.fix.TPV['climb'])*196.85
            spd = float(self.fix.TPV["speed"])*3.6
            hdg = self.fix.TPV["track"] if spd > 2 else 0
            self.alt = float(self.fix.TPV["alt"])
            alt = self.alt*3.28084
            self.data = '{"lat": %s, "lon": %s, "hdg": %d, "vs": %d, "alt": %d, "spd": %d, "pressureSL": %.2f, "pressureAlt": %.2f, "temperature": %.1f, "time": %s}' % (lat, lon, hdg, vs, alt, spd, imuWorker.getPressureSL(), imuWorker.getPressureAlt(), imuWorker.getTemperature(), json.dumps(time))
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

    if not os.path.exists("/etc/RTIMULib.ini"):
      print("Settings file does not exist, will be created")

    self.s = RTIMU.Settings("/etc/RTIMULib")
    self.imu = RTIMU.RTIMU(self.s)
    self.pressureSensor = RTIMU.RTPressure(self.s)

    if not self.imu.IMUInit():
      print("IMU Init Failed")
      sys.exit(1)

    if not self.pressureSensor.pressureInit():
      print("Pressure sensor Init Failed")
      sys.exit(1)

    self.imu.setSlerpPower(0.02)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)
    self.poll_interval = self.imu.IMUGetPollInterval()*1.0/1000.0
    self.data = 0
    self.lastData = 0
    self.pressureSL = 1013
    self.pressureAlt = 0
    self.temperature = 0

  def run(self):
    while not stopFlag:
      if self.imu.IMURead():
        data = self.imu.getIMUData()
        fusionPose = data["fusionPose"]
        (data["pressureValid"], data["pressure"], data["temperatureValid"], data["temperature"]) = self.pressureSensor.pressureRead()

        alt = gpsWorker.getAlt()
        #if alt >= 914.4: #surface S above 3000ft
        #  pressure = 1013.25
        #else:
        if data["pressureValid"]:
          if type(alt) is float:
            r = 1.0 - (alt/44330.0)
            self.pressureSL = data["pressure"] / math.pow(r, 5.255)
          else:
            self.pressureSL = 0
        else:
          self.pressureSL = 0

        self.pressureAlt = data["pressure"]

        self.temperature = data["temperature"] if data["temperatureValid"] else 0
        pitch = math.degrees(fusionPose[0])
        roll  = math.degrees(fusionPose[1])
        yaw   = math.degrees(fusionPose[2])
        rollRate = math.degrees(data["gyro"][0])
        yawRate  = math.degrees(data["gyro"][2])
        slip     = data["accel"][1]
        gForce   = data["accel"][2]
        if yaw < 90.1:
          heading = yaw + 270
        else:
          heading = yaw - 90
        if heading > 360.0:
          heading = heading - 360.0

        self.data = '{"pitch": %.2f, "roll": %.2f, "heading": %.2f, "gyro": %s, "accel": %s, "compass": %s, "fusionPose": %s}' % ( pitch, roll, heading, json.dumps(data["gyro"]), json.dumps(data["accel"]), json.dumps(data["compass"]), json.dumps(fusionPose) )
        time.sleep(self.poll_interval)

  def toDeg(self, number):
    v = math.degrees(number)
    #v = '%.1f' % v
    #v = round(float(v) * 2) / 2
    return v

  def get(self):
    if self.lastData is not self.data:
      self.lastData = self.data
      return self.data

  def getPressureSL(self):
    return self.pressureSL

  def getPressureAlt(self):
    return self.pressureAlt

  def getTemperature(self):
    return self.temperature


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

      time.sleep(0.1)

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


