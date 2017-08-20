EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:bme280
LIBS:proto-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 6 6
Title ""
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L BME280 U13
U 1 1 59855A17
P 5360 3080
F 0 "U13" H 5760 3400 60  0000 C CNN
F 1 "BME280" H 5360 3330 60  0000 C CNN
F 2 "aeroPi:BME280" H 5360 3080 60  0001 C CNN
F 3 "" H 5360 3080 60  0001 C CNN
	1    5360 3080
	1    0    0    -1  
$EndComp
$Comp
L C C20
U 1 1 59855A1E
P 4020 3320
F 0 "C20" H 4045 3420 50  0000 L CNN
F 1 "100n" H 4045 3220 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 4058 3170 50  0001 C CNN
F 3 "" H 4020 3320 50  0001 C CNN
	1    4020 3320
	1    0    0    -1  
$EndComp
$Comp
L C C21
U 1 1 59855A25
P 4330 3320
F 0 "C21" H 4355 3420 50  0000 L CNN
F 1 "100n" H 4355 3220 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 4368 3170 50  0001 C CNN
F 3 "" H 4330 3320 50  0001 C CNN
	1    4330 3320
	1    0    0    -1  
$EndComp
Wire Wire Line
	4330 3130 4810 3130
Wire Wire Line
	4020 2930 4810 2930
Wire Wire Line
	4020 2930 4020 3170
$Comp
L GND #PWR043
U 1 1 59855A2F
P 5080 3660
F 0 "#PWR043" H 5080 3410 50  0001 C CNN
F 1 "GND" H 5080 3510 50  0000 C CNN
F 2 "" H 5080 3660 50  0001 C CNN
F 3 "" H 5080 3660 50  0001 C CNN
	1    5080 3660
	1    0    0    -1  
$EndComp
Wire Wire Line
	4020 3470 4020 3550
Wire Wire Line
	4020 3550 6030 3550
Wire Wire Line
	5080 3550 5080 3660
Wire Wire Line
	4330 3470 4330 3550
Connection ~ 4330 3550
Wire Wire Line
	4810 3030 4680 3030
Wire Wire Line
	4680 3030 4680 3550
Connection ~ 4680 3550
Wire Wire Line
	4810 3230 4810 3550
Connection ~ 4810 3550
Wire Wire Line
	6030 3550 6030 2930
Wire Wire Line
	6030 2930 5860 2930
Connection ~ 5080 3550
Wire Wire Line
	4330 2560 4330 3170
Connection ~ 4330 2930
Wire Wire Line
	5860 3030 5980 3030
Wire Wire Line
	5980 3030 5980 2710
Wire Wire Line
	5980 2710 4330 2710
Connection ~ 4330 2710
Wire Wire Line
	5860 3130 6180 3130
Wire Wire Line
	5860 3230 6180 3230
Text Label 6180 3130 0    60   ~ 0
I2C_SDA
Text Label 6180 3230 0    60   ~ 0
I2C_SCLK
Text Label 4330 2560 2    60   ~ 0
+3.3V
Text HLabel 7910 2340 0    60   Input ~ 0
+3v3
Text HLabel 7910 2540 0    60   Input ~ 0
GND
Text HLabel 7910 2010 0    60   Input ~ 0
SDA
Text HLabel 7910 2180 0    60   Input ~ 0
SCL
Text Label 8090 2340 0    60   ~ 0
+3.3V
Text Label 8100 2010 0    60   ~ 0
I2C_SDA
Text Label 8090 2180 0    60   ~ 0
I2C_SCLK
$Comp
L GND #PWR044
U 1 1 59855B15
P 8230 2560
F 0 "#PWR044" H 8230 2310 50  0001 C CNN
F 1 "GND" H 8230 2410 50  0000 C CNN
F 2 "" H 8230 2560 50  0001 C CNN
F 3 "" H 8230 2560 50  0001 C CNN
	1    8230 2560
	1    0    0    -1  
$EndComp
Wire Wire Line
	7910 2540 8230 2540
Wire Wire Line
	8230 2540 8230 2560
Wire Wire Line
	7910 2340 8090 2340
Wire Wire Line
	7910 2010 8100 2010
Wire Wire Line
	7910 2180 8090 2180
Connection ~ 4330 3130
$EndSCHEMATC
