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
import read_RPM
import pigpio


SPI_PORT   = 0
SPI_DEVICE = 0
stopFlag   = False
imuWorker  = False
gpsWorker  = False
emsWorker  = False

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
#      sys.exit(1)

    if not self.pressureSensor.pressureInit():
      print("Pressure sensor Init Failed")
#      sys.exit(1)

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
        print(self.data)
        #(self.data["pressureValid"], self.data["pressure"], self.data["temperatureValid"], self.data["temperature"]) = self.pressureSensor.pressureRead()
        #self.data['temperature'] = self.data['temperature'] if self.data['temperatureValid'] else 0.0
        #self.data['temperature'] = clamp(-30, self.data['temperature'], 90)
        #self.data['pressure'] = self.data['pressure'] if self.data['pressureValid'] else 0.0
        #self.data['pressure'] = clamp(850, self.data['pressure'], 1250)
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
    self.mcp = Adafruit_MCP3008.MCP3008(clk=11, cs=8, miso=9, mosi=10)
    #self.mcp = Adafruit_MCP3008.MCP3008(spi=SPI.SpiDev(SPI_PORT, SPI_DEVICE))
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
    self.pi = pigpio.pi()
    self.rpmSensor = read_RPM.reader(self.pi, 25)
    self.fuelflowSensor = read_RPM.reader(self.pi, 24)
    self.i = 0

  def run(self):
    while not stopFlag:
      self.data['oilPress'] = self.getPressure(self.mcp.read_adc(0))
      self.data['oilTemp'] = self.getTemperature(self.mcp.read_adc(1))
      self.data['cht0'] = self.getTemperature(self.mcp.read_adc(2))
      #self.data['cht1'] = self.getTemperature(self.mcp.read_adc(3))
      #self.data['MaP'] = self.mcp.read_adc(4)
      #self.data['fuelPress'] = self.mcp.read_adc(5)
      self.data['voltage'] = self.getVoltage(self.mcp.read_adc(6))
      self.data['ASI'] = self.getAirspeed(self.mcp.read_adc(7))

      if self.i > 3:
        self.data['RPM'] = int(self.rpmSensor.RPM()+0.5)
        self.data['fuelFlow'] = self.getFuelFlow(self.fuelflowSensor.RPM())
        self.i = 0

      self.newData = '%s' % json.dumps(self.data);
      self.i += 1
      time.sleep(0.25);

    self.rpmSensor.cancel()
    self.fuelflowSensor.cancel()
    self.pi.stop()

  def getResistance(self, value):
    Vout = (value*self.V_Ref)/1024
    return int((Vout*self.R_Ref)/(self.V_Ref-Vout))

  def getVoltage(self, value):
    Vout = (value*self.V_Ref)/1024
    return Vout*5

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

  def getFuelFlow(self, value):
    return (value*60)/10500

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

  def getAirspeed(self, value):
    airspeed = value
    Vout = (value*self.V_Ref)/1024
    kPa = ((Vout / self.V_Ref)-0.2)/0.2
    Pa = abs(kPa*1000)
    if kPa < 0:
      Pa = 0
    mps = math.sqrt(2*Pa/1.225)
    kph = int(mps*3.6)
    #print("kph: %d" % kph)
    return kph

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
      if gpsWorker:
        gps = gpsWorker.get()
        if gps:
          self.sendData('{"GPS": %s}' % json.dumps(gps))

      if imuWorker:
        imu = imuWorker.get()
        if imu:
          self.sendData('{"IMU": %s}' % json.dumps(imu))

      if emsWorker:
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


