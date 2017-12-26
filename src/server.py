#!/usr/bin/env python3
import signal, sys
from subprocess import call
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
from Adafruit_BME280 import *
import ADS7828
import read_RPM
import pigpio
from enum import Enum
import pymysql
from datetime import datetime

stopFlag   = False
imuWorker  = False
gpsWorker  = False
emsWorker  = False
_USERID_   = 0

def clamp(minimum, value, maximum):
  return min(maximum, max(minimum, value))

def roundNearest(x, a):
  return round(round(x/a)*a, -int(math.floor(math.log10(a))))

def roundDown(x, a):
  return math.floor(x/a)*a

class EngineState(Enum):
    OFF  = 0
    ON   = 1

class GPSWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)

    self.session = gps3.GPSDSocket(host='localhost')
    self.fix = gps3.Fix()
    self.oldData = ''
    self.newData = ''
    self.data = {'lat':0.0, 'lng':0.0, 'time':0, 'alt':0, 'spd':0, 'climb':0, 'compass':0}
    self.systemDatetimeIsSet = False

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
            self.data['compass']   = int(self.fix.TPV['track']) if self.data['spd'] > 2 else 0
            if type(self.data['compass']) is str:
                self.data['compass'] = 0
            self.newData = '%s' % json.dumps(self.data)

            if self.systemDatetimeIsSet is False:
                try:
                    now = datetime.strptime(self.data['time'], '%Y-%m-%dT%H:%M:%S.000Z').timestamp()
                    call(['date', '-s', time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now))])
                    self.systemDatetimeIsSet = True
                except ValueError:
                    pass
          except ValueError:
            pass

          time.sleep(1)

  def get(self):
    if self.oldData != self.newData:
      self.oldData = self.newData
      return self.data


class IMUWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)

    if not os.path.exists("./RTIMULib.ini"):
      print("Settings file does not exist, will be created")

    self.settings = RTIMU.Settings("./RTIMULib")
    self.imu = RTIMU.RTIMU(self.settings)

    self.bme280 = BME280(t_mode=BME280_OSAMPLE_8, p_mode=BME280_OSAMPLE_8, h_mode=BME280_OSAMPLE_8, address=0x76)

    if not self.imu.IMUInit():
      print("IMU Init Failed")

    self.imu.setSlerpPower(0.02)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)

    self.pollInterval = self.imu.IMUGetPollInterval()
    self.oldData = ''
    self.newData = ''
    self.data = {'temperature':15, 'pressure':850, 'humidity':0, 'pitch':0, 'roll':0, 'yaw':0, 'slipball':0}

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
        self.IMUdata = self.imu.getIMUData()
        self.data['temperature'] = int(self.bme280.read_temperature()*10)/10
        self.data['pressure'] = self.bme280.read_pressure() / 100
        self.data['humidity'] = int(self.bme280.read_humidity())
        self.data['pitch'] = int(clamp(-180, math.degrees(self.IMUdata['fusionPose'][1]), 180))
        self.data['roll'] = int(clamp(-180, math.degrees(self.IMUdata['fusionPose'][0]), 180))
        self.data['yaw'] = int(math.degrees(self.IMUdata['fusionPose'][2]))-90
        self.data['slipball'] = int(self.IMUdata['accel'][1]*100)/100
        self.data['vs'] = int(self.IMUdata['accel'][2]*100)/100

        self.data['pressure'] = roundNearest(self.data['pressure'], 0.05)
        self.data['slipball'] = roundNearest(self.data['slipball'], 0.05)
        self.data['vs'] = roundNearest(self.data['vs'], 0.05)
        if self.data['yaw'] < 0:
          self.data['yaw'] = 360 + self.data['yaw']

        self.newData = '%s' % json.dumps(self.data)

        time.sleep(self.pollInterval*1.0/1000.0)

  def get(self):
    if self.oldData != self.newData:
      self.oldData = self.newData
      return self.data


class EMSWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.adc = ADS7828.ADS7828()
    self.oldData = ''
    self.newData = ''
    self.data = {'RPM':0, 'fuelFlow':0, 'fuelConsumed':0, 'MaP':0, 'cylTemp':0, 'cht1':0, 'oilTemp':0, 'oilPress':0, 'fuelPress':0, 'voltage':0, 'load':0}
    self.A = 1.572032517e-3
    self.B = 2.731146045e-4
    self.C = -2.867504522e-7
    self.V_Ref = 5.1
    self.R_Ref = 220
    self.basicResistorSerie = [10, 31, 52, 71, 88, 106, 124, 140, 155, 170, 184]
    self.precision = 5
    self.fuelFlowPulsesPerLiter = 10500
    self.completeResistorSerie = self.getCompleteResistorSerie()
    self.pi = pigpio.pi()
    self.rpmSensor = read_RPM.reader(self.pi, 18)
    self.fuelflowSensor = read_RPM.reader(self.pi, 17)
    self.i = 0

  def run(self):
    while not stopFlag:
      self.data['oilPress'] = self.getPressure(self.adc.readChannel(0))
      self.data['oilTemp'] = self.getTemperature(self.adc.readChannel(1))
      self.data['cylTemp'] = self.getTemperature(self.adc.readChannel(2))
      self.data['current'] = self.adc.readChannel(3)
      self.data['voltage'] = int(self.getVoltage(self.adc.readChannel(4))*10)/10
      self.data['ASI'] = self.getAirspeed(self.adc.readChannel(5))
      self.data['MAP'] = self.adc.readChannel(6)

      if self.i > 3:
        self.data['RPM'] = roundNearest(self.rpmSensor.RPM(), 25)
        self.data['fuelFlow'] = roundNearest(self.getFuelFlow(self.fuelflowSensor.RPM()), 0.2)
        fuelFlowPulses = self.fuelflowSensor.tally()
        self.data['fuelConsumed'] = roundNearest(fuelFlowPulses/self.fuelFlowPulsesPerLiter, 0.2)
        self.i = 0

      self.newData = '%s' % json.dumps(self.data);
      self.i += 1
      time.sleep(0.25);

    self.rpmSensor.cancel()
    self.fuelflowSensor.cancel()
    self.pi.stop()

  def getResistance(self, value):
    Vout = (value*self.V_Ref)/4096
    return int((Vout*self.R_Ref)/(self.V_Ref-Vout))

  def getVoltage(self, value):
    Vout = (value*self.V_Ref)/4096
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
    return (value*60)/self.fuelFlowPulsesPerLiter

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
    Vout = (value*self.V_Ref)/4096
    kPa = ((Vout / self.V_Ref)-0.2)/0.2
    Pa = abs(kPa*1000)
    if kPa < 0:
      Pa = 0
    mps = math.sqrt(2*Pa/1.225)
    kph = int(mps*3.6)
    return kph

  def get(self):
    if self.oldData != self.newData:
      self.oldData = self.newData
      return self.data


class MSGWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.db = pymysql.connect("localhost","aeropi","aeropi","aeropi" )
    self.cursor = self.db.cursor()
    self.connected    = set()
    self.engineState = EngineState.OFF
    self.currentEngineId = 0
    self.engineStartTime = 0
    self.engineStopTime  = 0

    self.lastUpdateLog = 0
    self.lastUpdateEms = 0
    self.lastUpdateImu = 0
    self.lastEms = None
    self.lastImu = None
    self.lastGps = None

  def run(self):
    while not stopFlag:
      now = 0

      if gpsWorker:
        gps = gpsWorker.get()
        if gps:
          self.lastGps = gps
          now = datetime.strptime(gps['time'], '%Y-%m-%dT%H:%M:%S.000Z').timestamp()
          self.sendData('{"GPS": %s}' % json.dumps(gps))

      if imuWorker:
        imu = imuWorker.get()
        if imu:
          self.lastImu = imu
          self.sendData('{"IMU": %s}' % json.dumps(imu))

      if emsWorker:
        ems = emsWorker.get()
        if ems:
          self.lastEms = ems
          dbWrite = False
          if ems['RPM'] > 500 and self.engineState == EngineState.OFF and now:
           self.startEngine(now)
           dbWrite = True

          if ems['RPM'] < 500 and self.engineState == EngineState.ON and now:
            self.stopEngine(now, ems)
            dbWrite = True

          ems['engine_state'] = 1 if self.engineState == EngineState.ON else 0

          if now and now - self.lastUpdateEms > 2:
            self.updateEngine(now)
            dbWrite = True

          if dbWrite:
            self.lastUpdateEms = now

          self.sendData('{"EMS": %s}' % json.dumps(ems))

      if now - self.lastUpdateLog > 10:
        self.updateLog(now, self.lastGps, self.lastEms, self.lastImu)
        self.lastUpdateLog = now        

      time.sleep(0.02)

    self.db.close()

  def updateLog(self, now, gps, ems, imu):
    sqltime = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now))
    user_id = _USERID_
    req = "INSERT INTO flightlogs (`user_id`"
    if gps is not None:
      req = "%s, `heading`, `latitude`, `longitude`, `altitude`, `datetime`, `groundspeed`" % req
    if ems is not None:
      req = "%s, `oilTemp`, `oilPress`, `cylTemp`, `rev`, `fuelFlow`, `voltage`, `current`, `map`" % req
    if imu is not None:
      req = "%s, `pitch`, `roll`, `yaw`" % req

    req = "%s) VALUES (%d" % (req, user_id)

    if gps is not None:
      req = "%s, %d, %f, %f, %d, '%s', %d" % (req, gps['compass'], gps['lat'], gps['lng'], gps['alt'], sqltime, gps['spd'])
    if ems is not None:
      req = "%s, %f, %f, %f, %d, %f, %f, %f, %f" % (req, ems['oilTemp'], ems['oilPress'], ems['cylTemp'], ems['RPM'], ems['fuelFlow'], ems['voltage'], ems['current'], ems['MAP'])
    if imu is not None:
      req = "%s, %d, %d, %d" % (req, imu['pitch'], imu['roll'], imu['yaw'])

    req = "%s)" % req

    try:
      self.cursor.execute(req)
      self.db.commit()
    except:
      self.db.rollback()

  def startEngine(self, now):
    self.engineStartTime = now
    self.engineState = EngineState.ON

    sqltime = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now))
    req = "INSERT INTO enginelogs (`update_date`, `start_date`) VALUES ('%s', '%s')" % (sqltime, sqltime)
    try:
      self.cursor.execute(req)
      self.db.commit()
      self.currentEngineId = self.cursor.lastrowid
    except:
      self.db.rollback()

  def stopEngine(self, now, ems):
    if self.currentEngineId > 0:
      self.engineStopTime = now
      elapsed = self.engineStopTime - self.engineStartTime
      self.engineState = EngineState.OFF

      sqltime = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now))
      req = "UPDATE enginelogs SET update_date='%s', stop_date='%s', fuel_consumed=%f, done=1 WHERE id=%d" % (sqltime, sqltime, ems['fuelConsumed'], self.currentEngineId)
      try:
        self.cursor.execute(req)
        self.db.commit()
        self.currentEngineId = 0
      except:
        self.db.rollback()

  def updateEngine(self, now):
    if self.currentEngineId > 0:
      sqltime = time.strftime('%Y-%m-%d %H:%M:%S', time.gmtime(now))
      req = "UPDATE enginelogs SET update_date='%s' WHERE id=%d" % (sqltime, self.currentEngineId)
      try:
        self.cursor.execute(req)
        self.db.commit()
      except:
        self.db.rollback()

  async def handler(self, websocket, path):
    self.connected.add(websocket)
    try:
      while True:
        message = await websocket.recv()
        await self.readMessage(message)
    except websockets.exceptions.ConnectionClosed:
      pass
    finally:
      self.connected.remove(websocket)

  def sendData(self, data):
    for websocket in self.connected.copy():
      coro = websocket.send(data)
      future = asyncio.run_coroutine_threadsafe(coro, loop)

  async def readMessage(self, message):
    global _USERID_
    try:
      data = json.loads(message)
      if data['type'] == "user_id":
        _USERID_ = int(data['user_id'])
    except json.JSONDecodeError:
      pass


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
