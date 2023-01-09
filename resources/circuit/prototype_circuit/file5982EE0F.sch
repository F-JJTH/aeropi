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
Sheet 2 6
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
L BSS138 Q5
U 1 1 59883275
P 5670 2130
F 0 "Q5" H 5670 1981 40  0000 R CNN
F 1 "BSS138" H 5670 2280 40  0000 R CNN
F 2 "TO_SOT_Packages_SMD:SOT-23" H 5540 2232 29  0000 C CNN
F 3 "" H 5670 2130 60  0000 C CNN
F 4 "621-DMG2305UX-13" H 5670 2130 60  0001 C CNN "Mouser Part No."
	1    5670 2130
	0    -1   -1   0   
$EndComp
Text HLabel 4670 2030 0    47   Input ~ 0
5V_SUPPLY
Text HLabel 6570 2030 2    47   Input ~ 0
5V_MCU
$Comp
L DMMT5401 U9
U 1 1 59883276
P 5670 3030
F 0 "U9" H 5370 3180 47  0000 C CNN
F 1 "DMMT5401" H 6120 2830 47  0000 C CNN
F 2 "w_smd_trans:sot23-6" H 5520 2730 47  0001 C CNN
F 3 "" H 5520 2730 47  0000 C CNN
F 4 "621-DMMT5401-7-F" H 5670 3030 60  0001 C CNN "Mouser Part No."
	1    5670 3030
	1    0    0    -1  
$EndComp
Wire Wire Line
	5870 2030 6570 2030
Wire Wire Line
	4670 2030 5470 2030
Wire Wire Line
	5470 2730 5470 2530
Wire Wire Line
	5470 2530 5320 2530
Wire Wire Line
	5320 2530 5320 2030
Connection ~ 5320 2030
Wire Wire Line
	5870 2730 5870 2530
Wire Wire Line
	5870 2530 6020 2530
Wire Wire Line
	6020 2530 6020 2030
Connection ~ 6020 2030
$Comp
L R R26
U 1 1 59883277
P 5870 3830
F 0 "R26" V 5950 3830 50  0000 C CNN
F 1 "47k" V 5877 3831 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 5800 3830 30  0001 C CNN
F 3 "" H 5870 3830 30  0000 C CNN
F 4 "667-ERJ-2RKF4702X" V 5870 3830 60  0001 C CNN "Mouser Part No."
	1    5870 3830
	1    0    0    -1  
$EndComp
$Comp
L R R25
U 1 1 59883278
P 5470 3830
F 0 "R25" V 5550 3830 50  0000 C CNN
F 1 "10k" V 5477 3831 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 5400 3830 30  0001 C CNN
F 3 "" H 5470 3830 30  0000 C CNN
F 4 "71-CRCW0402-10K-E3" V 5470 3830 60  0001 C CNN "Mouser Part No."
	1    5470 3830
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR015
U 1 1 59883279
P 5870 4230
F 0 "#PWR015" H 5870 3980 60  0001 C CNN
F 1 "GND" H 5870 4080 60  0000 C CNN
F 2 "" H 5870 4230 60  0000 C CNN
F 3 "" H 5870 4230 60  0000 C CNN
	1    5870 4230
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR016
U 1 1 5988327A
P 5470 4230
F 0 "#PWR016" H 5470 3980 60  0001 C CNN
F 1 "GND" H 5470 4080 60  0000 C CNN
F 2 "" H 5470 4230 60  0000 C CNN
F 3 "" H 5470 4230 60  0000 C CNN
	1    5470 4230
	1    0    0    -1  
$EndComp
Wire Wire Line
	5470 3380 5470 3680
Wire Wire Line
	5470 3980 5470 4230
Wire Wire Line
	5870 3380 5870 3680
Wire Wire Line
	5870 3980 5870 4230
Wire Wire Line
	5570 3380 5570 3480
Wire Wire Line
	5470 3480 5770 3480
Connection ~ 5470 3480
Wire Wire Line
	5770 3480 5770 3380
Connection ~ 5570 3480
Wire Wire Line
	5720 2330 5720 2630
Wire Wire Line
	5720 2630 6320 2630
Wire Wire Line
	6320 2630 6320 3480
Wire Wire Line
	6320 3480 5870 3480
Connection ~ 5870 3480
Text Notes 4470 1680 0    47   ~ 0
*Recomended back powering protection for raspberry pi. Recomended by\nRaspberyy Pi Foundation\nhttps://github.com/raspberrypi/hats/blob/master/designguide.md
$EndSCHEMATC
