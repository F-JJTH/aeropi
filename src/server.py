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

def pointInPolygon(point, polygon, pointOnVertex=True):
  # Transform string coordinates into arrays with x and y values
  point    = pointStringToCoordinates(point)
  vertices = []
  for vertex in polygon:
    vertices.append(pointStringToCoordinates(vertex))

  # Check if the point sits exactly on a vertex
  if pointOnVertex is True and isPointOnVertex(point, vertices) is True:
    return True

  # Check if the point is inside the polygon or on the boundary
  intersections = 0
  vertices_count = len(vertices)

  for i in range(1, vertices_count):
    vertex1 = vertices[i-1]
    vertex2 = vertices[i]
    # Check if point is on an horizontal polygon boundary
    if vertex1['y'] == vertex2['y'] and vertex1['y'] == point['y'] and point['x'] > min(vertex1['x'], vertex2['x']) and point['x'] < max(vertex1['x'], vertex2['x']):
      return True

    if point['y'] > min(vertex1['y'], vertex2['y']) and point['y'] <= max(vertex1['y'], vertex2['y']) and point['x'] <= max(vertex1['x'], vertex2['x']) and vertex1['y'] != vertex2['y']:
      xinters = (point['y'] - vertex1['y']) * (vertex2['x'] - vertex1['x']) / (vertex2['y'] - vertex1['y']) + vertex1['x']
      if xinters == point['x']: # Check if point is on the polygon boundary (other than horizontal)
        return True
      if vertex1['x'] == vertex2['x'] or point['x'] <= xinters:
        intersections += 1

  # If the number of edges we passed through is odd, then it's in the polygon.
  if intersections % 2 != 0:
    return True
  else:
    return False

def isPointOnVertex(point, vertices):
  for vertex in vertices:
    if point == vertex:
      return True
  return False

def pointStringToCoordinates(pointString):
  return {'x': pointString[0], 'y': pointString[1]}

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

  def getPredictivePoint(self):
    gs = self.data['spd']
    if gs <= 20:
        f  = 60 / 5 #5 minutes
        gs = 10*f # 10 kms

    brg  = math.radians(self.data['compass'])
    R    = 6372.7976 # Earth radius
    d    = round(gs) * 5 / 60 # 5 mintute ahead
    dist = round(d, 4)/R
    lat0 = math.radians(self.data['lat'])
    lon0 = math.radians(self.data['lng'])
    lat1 = math.asin(math.sin(lat0)*math.cos(dist) + math.cos(lat0)*math.sin(dist)*math.cos(brg))
    lon1 = lon0 + math.atan2(math.sin(brg)*math.sin(dist)*math.cos(lat0), math.cos(dist)-math.sin(lat0)*math.sin(lat1))
    return {'lng': round(math.degrees(lon1), 6), 'lat': round(math.degrees(lat1), 6)}

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
            self.data['climb'] = clamp(-5000, int(float(self.fix.TPV['climb'])*196.85), 5000)
            self.data['compass']   = int(self.fix.TPV['track']) if self.data['spd'] > 2 else 0
            if type(self.data['compass']) is str:
                self.data['compass'] = 0

            predictivePoint = self.getPredictivePoint()
            self.data['predictiveLat'] = predictivePoint['lat']
            self.data['predictiveLng'] = predictivePoint['lng']

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
    self.bme280LastRead = 0;

    if not self.imu.IMUInit():
      print("IMU Init Failed")

    self.imu.setSlerpPower(0.005)
    self.imu.setGyroEnable(True)
    self.imu.setAccelEnable(True)
    self.imu.setCompassEnable(True)

    self.pollInterval = self.imu.IMUGetPollInterval()
    self.oldData = ''
    self.newData = ''
    self.data = {'temperature':15, 'pressure':850, 'humidity':0, 'pitch':0, 'roll':0, 'yaw':0, 'slipball':0, 'qnh':1013}
    self.currentQNH = 1013
    self.prevPressure = 0.0

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
        now = time.time()
        elapsedTimeSinceLastRead = now - self.bme280LastRead
        if elapsedTimeSinceLastRead > 1:
            self.data['temperature'] = int(self.bme280.read_temperature()*10)/10
            self.data['humidity'] = int(self.bme280.read_humidity())
            self.data['pressure'] = roundNearest(self.bme280.read_pressure() / 100, 0.1)
            self.data['altitudePressure'] = roundNearest(self.getAltitudePressure(), 50)
            self.data['dewpoint'] = roundNearest(self.bme280.read_dewpoint(), 0.5)
            self.data['climb'] = self.getClimbRate(elapsedTimeSinceLastRead)

            self.prevPressure = self.data['pressure']
            self.bme280LastRead = now

        self.data['pitch'] = int(clamp(-180, math.degrees(self.IMUdata['fusionPose'][1]), 180))
        self.data['roll'] = int(clamp(-180, math.degrees(self.IMUdata['fusionPose'][0]), 180))
        self.data['slipball'] = -int(self.IMUdata['accel'][1]*100)/100
        self.data['vs'] = int(self.IMUdata['accel'][2]*100)/100
        self.data['slipball'] = roundNearest(self.data['slipball'], 0.1)
        self.data['vs'] = roundNearest(self.data['vs'], 0.5)
        self.data['yaw'] = int(math.degrees(self.IMUdata['fusionPose'][2]))-180
        if self.data['yaw'] < 0:
          self.data['yaw'] = 360 + self.data['yaw']

        self.data['qnh'] = self.currentQNH

        self.newData = '%s' % json.dumps(self.data)

        time.sleep(self.pollInterval*1.0/1000.0)

  def getClimbRate(self, dt):
    deltaPressure = self.prevPressure - self.data['pressure']
    return int(33.0*deltaPressure*(60/dt))

  def getPressure(self):
    return self.data['pressure']

  def setQNH(self, QNH):
    self.currentQNH = QNH

  def getAltitudePressure(self):
    return self._computeAltPress(self.currentQNH*100, 288.15, self.data['pressure']*100)*3.28084

  def _computeAltPress(self, a, k, i):
    M = 0.0289644
    g = 9.80665
    R = 8.31432
    if (a / i) < (101325 / 22632.1):
      d = - 0.0065
      e = 0
      j = math.pow((i / a), (R * d) / (g * M))
      return e + ((k * ((1 / j) - 1)) / d)
    else :
      if (a / i) < (101325 / 5474.89):
        e = 11000
        b = k - 71.5
        f = (R * b * (math.log(i / a))) / (( - g) * M)
        l = 101325
        c = 22632.1
        h = ((R * b * (math.log(l / c))) / (( - g) * M)) + e
        return h + f
    return

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
    self.V_Ref = 5.07
    self.resolution = 4096
    self.R_Ref = 220
    self.basicResistorSerie = [10, 31, 52, 71, 88, 106, 124, 140, 155, 170, 184]
    self.precision = 5
    self.fuelFlowPulsesPerLiter = 1300
    self.completeResistorSerie = self.getCompleteResistorSerie()
    self.pi = pigpio.pi()
    self.rpmSensor = read_RPM.reader(self.pi, 18)
    self.fuelflowSensor = read_RPM.reader(self.pi, 17)
    self.i = 0
    self.airPressure = 0

  def run(self):
    while not stopFlag:
      self.data['oilPress'] = self.getPressure(self.adc.readChannel(0))
      self.data['oilTemp'] = self.getTemperature(self.adc.readChannel(1))
      self.data['cylTemp'] = self.getTemperature(self.adc.readChannel(2))
      self.data['current'] = roundNearest(self.getCurrent(self.adc.readChannel(3)), 0.2)
      self.data['voltage'] = int(self.getVoltage(self.adc.readChannel(4))*10)/10
      self.data['ASI'] = self.getAirspeed(self.adc.readChannel(5))
      self.data['MAP'] = self.getMap(self.adc.readChannel(6))

      #if self.i > 1:
      self.data['RPM'] = roundNearest(self.rpmSensor.RPM(), 50)
      self.data['fuelFlow'] = roundNearest(self.getFuelFlow(self.fuelflowSensor.RPM()), 0.2)
      fuelFlowPulses = self.fuelflowSensor.tally()
      self.data['fuelConsumed'] = roundNearest(fuelFlowPulses/self.fuelFlowPulsesPerLiter, 0.2)
      #self.i = 0

      self.newData = '%s' % json.dumps(self.data);
      #self.i += 1
      time.sleep(1);

    self.rpmSensor.cancel()
    self.fuelflowSensor.cancel()
    self.pi.stop()

  def resetFuelConsumed(self):
    self.fuelflowSensor.reset_tally()

  def getResistance(self, value):
    Vout = (value*self.V_Ref)/self.resolution
    if self.V_Ref - Vout == 0:
      return int(Vout*self.R_Ref)
    return int((Vout*self.R_Ref)/(self.V_Ref-Vout))

  def getVoltage(self, value):
    Vout = (value*self.V_Ref)/self.resolution
    return Vout*5.120967742

  def getCurrent(self, value):
    Vout = (value*self.V_Ref)/self.resolution
    A = (Vout - 2.5197) / 0.0631
    return A

  def getTemperature(self, value):
    T = 0
    R = self.getResistance(value)
    if R < 3200 and R is not 0: # above this resistance we are negative
      T = 1/(self.A + self.B*math.log(R) + self.C*math.pow(math.log(R),3) )-273.15;
    return int(roundNearest(T, 2))

  def getPressure(self, value):
    R = self.getResistance(value)
    P = self.find_nearest(self.completeResistorSerie, R) / self.precision
    return roundNearest(P, 0.2)

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
    Vout = (value*self.V_Ref)/self.resolution
    kPa = ((Vout / self.V_Ref)-0.2)/0.2
    Pa = abs(kPa*1000)
    if kPa < 0:
      Pa = 0
    mps = math.sqrt(2*Pa/1.225)
    kph = int(mps*3.6)
    return roundNearest(kph, 2)

  def getMap(self, value):
    Vout = (value*self.V_Ref)/self.resolution
    kPa = ((Vout / self.V_Ref)+0.095)/0.009
    hPa = roundNearest(kPa*10, 0.1)
    self.airPressure = imuWorker.getPressure()
    mapPressure =  roundNearest(self.airPressure - hPa, 0.1)
    return mapPressure

  def get(self):
    if self.oldData != self.newData:
      self.oldData = self.newData
      return self.data


class MSGWorker (threading.Thread):
  def __init__(self):
    threading.Thread.__init__(self)
    self.db = pymysql.connect("localhost","aeropi","aeropi","aeropi" )
    self.cursor = self.db.cursor()
    self.connected   = set()
    self.engineState = EngineState.OFF
    self.fuelLevelAtStartEngine = 0
    self.currentFuelLevel = 0
    self.currentEngineId = 0
    self.engineStartTime = 0
    self.engineStopTime  = 0

    self.lastUpdateLog = 0
    self.lastUpdateEms = 0
    self.lastUpdateImu = 0
    self.lastEms = None
    self.lastImu = None
    self.lastGps = None
    self.readFuelLevelFromDB()

  def readFuelLevelFromDB(self):
    # retrieve the last tank level
    req = "SELECT level FROM tanks WHERE id=1"
    try:
      self.cursor.execute(req)
      result = self.cursor.fetchone()
      self.fuelLevelAtStartEngine = result[0]
      self.currentFuelLevel = self.fuelLevelAtStartEngine
    except:
      pass

  def getGeometryAsArray(self, geom):
    polygon  = geom[9:-2]
    coords   = polygon.split(',')
    polygon  = []
    for coord in coords:
      lon1, lat1 = coord.split(' ')
      polygon.append([float(lon1), float(lat1)])

    return polygon

  def isInPolygon(self, row):
    point = [self.lastGps['lng'], self.lastGps['lat']]
    if pointInPolygon(point, row['g']):
        return True
    return False

  def getCurrentAirspace(self):
    req = "SELECT id, name, type, class, activities, remarks, upper, lower, minimum, maximum, AsText(g) FROM airspaces WHERE id > 0 AND Contains(g, GeomFromText('POINT(%s %s)')) AND lower <= %s AND upper >= %s" % (self.lastGps['lng'], self.lastGps['lat'], self.lastGps['alt'], self.lastGps['alt'])
    airspaces = []
    try:
      self.cursor.execute(req)
      results = self.cursor.fetchall()
      for result in results:
        geom = self.getGeometryAsArray(result[10])
        row = {'id': result[0], 'name': result[1], 'type': result[2], 'class': result[3], 'activities': result[4], 'remarks': result[5], 'upper': result[6], 'lower': result[7], 'minimum': result[8], 'maximum': result[9], 'g': geom}
        if self.isInPolygon(row) is True:
          airspaces.append(row)
    except:
      pass

    return airspaces

  def getPredictiveAirspace(self):
    req = "SELECT id, name, type, class, activities, remarks, upper, lower, minimum, maximum, AsText(g) FROM airspaces WHERE id > 0 AND Contains(g, GeomFromText('POINT(%s %s)')) AND lower <= %s AND upper >= %s" % (self.lastGps['predictiveLng'], self.lastGps['predictiveLat'], self.lastGps['alt'], self.lastGps['alt'])
    airspaces = []
    try:
      self.cursor.execute(req)
      results = self.cursor.fetchall()
      for result in results:
        geom = self.getGeometryAsArray(result[10])
        row = {'id': result[0], 'name': result[1], 'type': result[2], 'class': result[3], 'activities': result[4], 'remarks': result[5], 'upper': result[6], 'lower': result[7], 'minimum': result[8], 'maximum': result[9], 'g': geom}
        if self.isInPolygon(row) is True:
          airspaces.append(row)
    except:
      pass

    return airspaces

  def run(self):
    while not stopFlag:
      now = 0

      if gpsWorker:
        gps = gpsWorker.get()
        if gps:
          self.lastGps = gps
          now = datetime.strptime(gps['time'], '%Y-%m-%dT%H:%M:%S.000Z').timestamp()
          gps['currentAirspace'] = self.getCurrentAirspace()
          gps['predictiveAirspace'] = self.getPredictiveAirspace()
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
            self.updateEngine(now, ems)
            dbWrite = True

          ems['fuelLevel'] = self.currentFuelLevel

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
        ems.resetFuelConsumed()
      except:
        self.db.rollback()

  def updateEngine(self, now, ems):
    if self.engineState == EngineState.ON:
      self.currentFuelLevel = self.fuelLevelAtStartEngine - ems['fuelConsumed']
      req = "UPDATE tanks SET level=%f WHERE id=1" % self.currentFuelLevel
      try:
        self.cursor.execute(req)
        self.db.commit()
      except:
        self.db.rollback()

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
      if data['type'] == "user_id" and _USERID_ == 0:
        _USERID_ = int(data['user_id'])

      if data['type'] == "refuel":
        self.readFuelLevelFromDB()

      if data['type'] == "QNH":
        imuWorker.setQNH(float(data['QNH']))

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
