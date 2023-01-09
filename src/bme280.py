#!/usr/bin/env python3
# coding=utf-8

import smbus2 as smbus

class BME280:
	"""
	A class to read BME280 data
	"""
	def __init__(self, i2c_address=0x76, i2c_bus=1):
		"""
		BME280 initialization
		"""
		self.i2c_address = i2c_address
		self.i2c_bus = i2c_bus
		self.
	
	def _read_byte_data(self, byte):

	def _write_byt_data(self, byte):
		


   def _cbf(self, gpio, level, tick):

      if level == 1: # Rising edge.

         if self._high_tick is not None:
            t = pigpio.tickDiff(self._high_tick, tick)

            if self._period is not None:
               self._period = (self._old * self._period) + (self._new * t)
            else:
               self._period = t

         self._high_tick = tick

      elif level == 2: # Watchdog timeout.

         if self._period is not None:
            if self._period < 2000000000:
               self._period += (self._watchdog * 1000)

   def RPM(self):
      """
      Returns the RPM.
      """
      RPM = 0.0
      if self._period is not None:
         RPM = 60000000.0 / (self._period * self.pulses_per_rev)
         if RPM < self.min_RPM:
            RPM = 0.0

      return RPM

   def cancel(self):
      """
      Cancels the reader and releases resources.
      """
      self.pi.set_watchdog(self.gpio, 0) # cancel watchdog
      self._cb.cancel()
