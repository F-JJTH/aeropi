#!/usr/bin/env python3
import math

class GPSWorker:
    def __init__(self):
        self.position = {'lng': 5.6547, 'lat': 44.5684}

    def destSphere(self, coord, heading, speed):
        brg  = math.degrees(heading)*math.pi/180
        R    = 6372.7976 # Earth radius
        d    = round(speed) * 5 / 60
        dist = round(d, 4)/R
        lat0 = math.radians(coord['lat'])
        lon0 = math.radians(coord['lng'])
        lat1 = math.asin(math.sin(lat0)*math.cos(dist) + math.cos(lat0)*math.sin(dist)*math.cos(brg))
        lon1 = lon0 + math.atan2(math.sin(brg)*math.sin(dist)*math.cos(lat0), math.cos(dist)-math.sin(lat0)*math.sin(lat1))
        return {'lng': round(math.degrees(lon1), 6), 'lat': round(math.degrees(lat1), 6)}


    def getPredictivePoint(self):
        return self.destSphere(self.position, 0, 100)



gpsWorker = GPSWorker()
predictivePoint = gpsWorker.getPredictivePoint()
print("lat: ", predictivePoint['lat'], "lng :", predictivePoint['lng'])

ss = "coucou %s toto %s" % (predictivePoint['lat'], predictivePoint['lng'])
print(ss)
