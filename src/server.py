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
import Adafruit_GPIO.SPI as SPI
import Adafruit_MCP3008


SPI_PORT   = 0
SPI_DEVICE = 0
stopFlag = False

def clamp(minimum, value, maximum):
  return min(maximum, max(minimum, value))


class GPSWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)

    self.session = gps3.GPSDSocket(host='localhost')
    self.fix = gps3.Fix()
    self.oldData = {}
    self.newData = {}
    self.data = {'lat':0.0, 'lng':0.0, 'time':0, 'alt':0, 'spd':0, 'climb':0, 'compass':0}

  def run(self):
    while not stopFlag:
      for new_data in self.session:
        if stopFlag:
          break
      
        if new_data:
          self.fix.refresh(new_data)
          '''
          GPS data are:
          	speed: double
          	device: string
          	epy: double
          	ept: double
          	epc: double
          	track: double
          	eps: double
          	lat: double
          	epd: n/a
          	time: aaaa-mm-ddThh:mm:ss.000Z
          	mode: int
          	epx: double
          	epv: double
          	tag: string
          	alt: double
          	lon: double
          	climb: double
          '''
          try:
            self.data['lat']   = self.fix.TPV['lat']
            self.data['lng']   = self.fix.TPV['lon']
            self.data['time']  = self.fix.TPV['time']
            self.data['alt']   = clamp(0, int(float(self.fix.TPV['alt'])*3.28084), 35000)
            self.data['spd']   = clamp(0, int(float(self.fix.TPV['speed'])*3.6), 500)
            self.data['climb'] = clamp(-5000, int(float(self.fix.TPV['climb'])*196.5), 5000)
            self.data['compass']   = self.fix.TPV['track'] if self.data['spd'] > 2 else 0
            if type(self.data['compass']) is str:
                self.data['compass'] = 0.0
            self.newData = '%s' % json.dumps(self.data)
          except ValueError:
            pass

  def get(self):
    if self.oldData is not self.newData:
      self.oldData = self.newData
      return self.data



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
    self.oldData = {}
    self.newData = {}
    self.data = {'temperature':15, 'pressure':850, 'pitch':0, 'roll':0, 'yaw':0}

  def run(self):
    while not stopFlag:
      if self.imu.IMURead():
        '''
        IMU data are:
		    pressure: double
		    temperature: double
		    accel:(double, double, double)
		    compassValid: bool
		    humidityValid: bool
		    timestamp: timestamp
		    compass: (double, double, double)
		    fusionQPose: (double, double, double, double)
		    fusionPose: (double, double, double)
		    humidity: double
		    pressureValid: bool
		    fusionQPoseValid: bool
		    gyroValid: bool
		    accelValid: bool
		    temperatureValid: bool
		    gyro: (double, double, double)
		    fusionPoseValid: bool
		Pressure data are:
			pressureValid: bool
			pressure: double
			temperatureValid: bool
			temperature: double
        '''
        self.data = self.imu.getIMUData()
        (self.data["pressureValid"], self.data["pressure"], self.data["temperatureValid"], self.data["temperature"]) = self.pressureSensor.pressureRead()
        self.data['temperature'] = self.data['temperature'] if self.data['temperatureValid'] else 0.0
        self.data['temperature'] = clamp(-30, self.data['temperature'], 90)
        self.data['pressure'] = self.data['pressure'] if self.data['pressureValid'] else 0.0
        self.data['pressure'] = clamp(850, self.data['pressure'], 1250)
        self.data['pitch'] = clamp(-180, math.degrees(self.data['fusionPose'][0]), 180)
        self.data['roll'] = clamp(-180, math.degrees(self.data['fusionPose'][1]), 180)
        self.data['yaw'] = math.degrees(self.data['fusionPose'][2])
        self.data['slipball'] = self.data['accel'][0]
        del self.data['timestamp']
        del self.data['accelValid']
        del self.data['compassValid']
        del self.data['fusionPoseValid']
        del self.data['fusionQPoseValid']
        del self.data['gyroValid']
        del self.data['humidityValid']
        del self.data['temperatureValid']
        del self.data['pressureValid']
        del self.data['humidity']
        
        self.newData = '%s' % json.dumps(self.data)

        '''
        if yaw < 90.1:
          heading = yaw + 270
        else:
          heading = yaw - 90
        if heading > 360.0:
          heading = heading - 360.0
        '''
        time.sleep(1.0/20.0)

  def get(self):
    if self.oldData is not self.newData:
      self.oldData = self.newData
      return self.data


class EMSWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.mcp = Adafruit_MCP3008.MCP3008(spi=SPI.SpiDev(SPI_PORT, SPI_DEVICE))
    self.oldData = {}
    self.newData = {}
    self.data = {'MaP':0, 'cht0':0, 'cht1':0, 'oilTemp':0, 'oilPress':0, 'fuelPress':0, 'voltage':0, 'load':0}
    self.A = 1.572032517e-3
    self.B = 2.731146045e-4
    self.C = -2.867504522e-7
    self.V_Ref = 5.095
    self.R_Ref = 220
    self.basicResistorSerie = [10, 31, 52, 71, 88, 106, 124, 140, 155, 170, 184]
    self.precision = 5
    self.completeResistorSerie = self.getCompleteResistorSerie()

  def run(self):
    while not stopFlag:
      self.data['oilPress'] = self.getPressure(self.mcp.read_adc(0))
      self.data['oilTemp'] = self.getTemperature(self.mcp.read_adc(1))
      self.data['cht0'] = self.getTemperature(self.mcp.read_adc(2))
      #self.data['cht1'] = self.getTemperature(self.mcp.read_adc(3))
      #self.data['MaP'] = self.mcp.read_adc(4)
      #self.data['fuelPress'] = self.mcp.read_adc(5)
      #self.data['voltage'] = self.mcp.read_adc(6)
      #self.data['load'] = self.mcp.read_adc(7)
      
      self.newData = '%s' % json.dumps(self.data);
      time.sleep(0.5);

  def getResistance(self, value):
    Vout = (value*self.V_Ref)/1024
    return int((Vout*self.R_Ref)/(self.V_Ref-Vout))
    
  def getTemperature(self, value):
    T = 0
    R = self.getResistance(value)
    if R < 3200 and R is not 0: # above this resistance we are negative
      T = 1/(self.A + self.B*math.log(R) + self.C*math.pow(math.log(R),3) )-273.15;
    return int(T)
  
  def getPressure(self, value):
    P = 0.0
    R = self.getResistance(value)
    return self.find_nearest(self.completeResistorSerie, R) / self.precision

  def find_nearest(self, array, value):
    n = [abs(i-value) for i in array]
    idx = n.index(min(n))
    return idx

  def getCompleteResistorSerie(self):
    serie = []
    for i in range(len(self.basicResistorSerie)-1):
      ratio = (self.basicResistorSerie[i+1] - self.basicResistorSerie[i]) / self.precision
      for m in range(0, self.precision):
        value = round(self.basicResistorSerie[i]+ratio*m, 1)
        serie.append(value)
    serie.append(self.basicResistorSerie[-1])
    return serie

  def get(self):
    if self.oldData is not self.newData:
      self.oldData = self.newData
      return self.data



class MSGWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.connected = set()

  def run(self):
    while not stopFlag:
      gps = gpsWorker.get()
      if gps:
        self.sendData('{"GPS": %s}' % json.dumps(gps))

      imu = imuWorker.get()
      if imu:
        self.sendData('{"IMU": %s}' % json.dumps(imu))

      ems = emsWorker.get()
      if ems:
        self.sendData('{"EMS": %s}' % json.dumps(ems))

      time.sleep(1.0/100.0)

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
  emsWorker = EMSWorker()
  msgWorker = MSGWorker()

  try:
    gpsWorker.start()
    imuWorker.start()
    emsWorker.start()
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


