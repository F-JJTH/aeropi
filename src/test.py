#!/usr/bin/env python3
import pymysql
import math
import time
from madgwick_ahrs import MadgwickAHRS



def getPredictivePoint(spd, compass, lat, lng):
    gs = spd
    if gs <= 20:
        f  = 60 / 5 #5 minutes
        gs = 10*f # 10 kms

    brg  = math.radians(compass)
    R    = 6372.7976 # Earth radius
    d    = gs * 5 / 60 # 5 mintute ahead
    dist = d/R
    lat0 = math.radians(lat)
    lon0 = math.radians(lng)
    lat1 = math.asin(math.sin(lat0)*math.cos(dist) + math.cos(lat0)*math.sin(dist)*math.cos(brg))
    lon1 = lon0 + math.atan2(math.sin(brg)*math.sin(dist)*math.cos(lat0), math.cos(dist)-math.sin(lat0)*math.sin(lat1))
    return {'lng': round(math.degrees(lon1), 6), 'lat': round(math.degrees(lat1), 6)}

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
    #print('point',point)
    #print(vertex1, ' ', vertex2)
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

def isInPolygon(row):
  geometry = row['g'];
  polygon  = geometry[9:-2]
  coords   = polygon.split(',')
  polygon  = []
  for coord in coords:
      lon1, lat1 = coord.split(' ')
      polygon.append([float(lon1), float(lat1)])

  row['g'] = polygon
  point = [5.0925064086914,43.961932015917]
  if pointInPolygon(point, polygon) is True:
    return True



def getClimbRate(prevPressure, currPressure, dt):
  print(dt)
  deltaPressure = prevPressure - currPressure
  return int(33.0*deltaPressure*(60/dt))



gyro    = [0, 1, 0]
accel   = [1, 0, 0]
compass = [0, 0, 0]

AHRS = MadgwickAHRS()
AHRS.update(gyro, accel, compass)
roll, pitch, yaw  = AHRS.getRollPitchYaw()
print('roll ', roll)
print('pitch ', pitch)
print('yaw ', yaw)

"""
pollInterval = 2
bme280LastRead = 0

while(1):
    now = time.time()
    elapsedTimeSinceLastRead = now - bme280LastRead
    if elapsedTimeSinceLastRead > 1:
        climb = getClimbRate(1000.0, 1000.5, elapsedTimeSinceLastRead)
        print(climb)
        bme280LastRead = now

    time.sleep(pollInterval)
"""


"""
spd = 100
compass = 270
lat = 44
lng = 5

coord = getPredictivePoint(spd, compass, lat, lng)
print(coord)
"""


"""
db = pymysql.connect("192.168.0.252", "aeropi", "aeropi", "aeropi")
cursor = db.cursor()

inPoint = [5.0925064086914,43.961932015917]
alt = 8500
req = "SELECT id, name, type, class, activities, remarks, upper, lower, minimum, maximum, AsText(g) FROM airspaces WHERE id > 0 AND Contains(g, GeomFromText('POINT(%s %s)')) AND lower <= %s AND upper >= %s" % (inPoint[0], inPoint[1], alt, alt)
airspaces = []
try:
  cursor.execute(req)
  results = cursor.fetchall()

  for result in results:
    row = {'id': result[0], 'name': result[1], 'type': result[2], 'class': result[3], 'activities': result[4], 'remarks': result[5], 'upper': result[6], 'lower': result[7], 'minimum': result[8], 'maximum': result[9], 'g': result[10]}
    
    if isInPolygon(row) is True:
      airspaces.append(row)

  #print(row['g'])
  print(airspaces)
  
except:
  pass

"""

