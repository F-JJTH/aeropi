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
LIBS:aeroPi
LIBS:bme280
LIBS:aeroPi-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 2 2
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
L BSS138 Q1
U 1 1 54F14605
P 9640 1260
F 0 "Q1" H 9640 1111 40  0000 R CNN
F 1 "BSS138" H 9640 1410 40  0000 R CNN
F 2 "TO_SOT_Packages_SMD:SOT-23" H 9510 1362 29  0000 C CNN
F 3 "" H 9640 1260 60  0000 C CNN
F 4 "621-DMG2305UX-13" H 9640 1260 60  0001 C CNN "Mouser Part No."
	1    9640 1260
	0    -1   -1   0   
$EndComp
Text HLabel 8640 1160 0    47   Input ~ 0
5V_SUPPLY
Text HLabel 10540 1160 2    47   Input ~ 0
5V_MCU
$Comp
L DMMT5401 U5
U 1 1 54F1CFA3
P 9640 2160
F 0 "U5" H 9340 2310 47  0000 C CNN
F 1 "DMMT5401" H 10090 1960 47  0000 C CNN
F 2 "w_smd_trans:sot23-6" H 9490 1860 47  0001 C CNN
F 3 "" H 9490 1860 47  0000 C CNN
F 4 "621-DMMT5401-7-F" H 9640 2160 60  0001 C CNN "Mouser Part No."
	1    9640 2160
	1    0    0    -1  
$EndComp
Wire Wire Line
	9840 1160 10540 1160
Wire Wire Line
	8640 1160 9440 1160
Wire Wire Line
	9440 1860 9440 1660
Wire Wire Line
	9440 1660 9290 1660
Wire Wire Line
	9290 1660 9290 1160
Connection ~ 9290 1160
Wire Wire Line
	9840 1860 9840 1660
Wire Wire Line
	9840 1660 9990 1660
Wire Wire Line
	9990 1660 9990 1160
Connection ~ 9990 1160
$Comp
L R R12
U 1 1 54F1D101
P 9840 2960
F 0 "R12" V 9920 2960 50  0000 C CNN
F 1 "47k" V 9847 2961 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 9770 2960 30  0001 C CNN
F 3 "" H 9840 2960 30  0000 C CNN
F 4 "667-ERJ-2RKF4702X" V 9840 2960 60  0001 C CNN "Mouser Part No."
	1    9840 2960
	1    0    0    -1  
$EndComp
$Comp
L R R11
U 1 1 54F1D193
P 9440 2960
F 0 "R11" V 9520 2960 50  0000 C CNN
F 1 "10k" V 9447 2961 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 9370 2960 30  0001 C CNN
F 3 "" H 9440 2960 30  0000 C CNN
F 4 "71-CRCW0402-10K-E3" V 9440 2960 60  0001 C CNN "Mouser Part No."
	1    9440 2960
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR034
U 1 1 54F1D1B9
P 9840 3360
AR Path="/54F1D1B9" Ref="#PWR034"  Part="1" 
AR Path="/54F145DC/54F1D1B9" Ref="#PWR036"  Part="1" 
F 0 "#PWR036" H 9840 3110 60  0001 C CNN
F 1 "GND" H 9840 3210 60  0000 C CNN
F 2 "" H 9840 3360 60  0000 C CNN
F 3 "" H 9840 3360 60  0000 C CNN
	1    9840 3360
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR035
U 1 1 54F1D1D3
P 9440 3360
AR Path="/54F1D1D3" Ref="#PWR035"  Part="1" 
AR Path="/54F145DC/54F1D1D3" Ref="#PWR037"  Part="1" 
F 0 "#PWR037" H 9440 3110 60  0001 C CNN
F 1 "GND" H 9440 3210 60  0000 C CNN
F 2 "" H 9440 3360 60  0000 C CNN
F 3 "" H 9440 3360 60  0000 C CNN
	1    9440 3360
	1    0    0    -1  
$EndComp
Wire Wire Line
	9440 2510 9440 2810
Wire Wire Line
	9440 3110 9440 3360
Wire Wire Line
	9840 2510 9840 2810
Wire Wire Line
	9840 3110 9840 3360
Wire Wire Line
	9540 2510 9540 2610
Wire Wire Line
	9440 2610 9740 2610
Connection ~ 9440 2610
Wire Wire Line
	9740 2610 9740 2510
Connection ~ 9540 2610
Wire Wire Line
	9690 1460 9690 1760
Wire Wire Line
	9690 1760 10290 1760
Wire Wire Line
	10290 1760 10290 2610
Wire Wire Line
	10290 2610 9840 2610
Connection ~ 9840 2610
Text Notes 8440 810  0    47   ~ 0
*Recomended back powering protection for raspberry pi. Recomended by\nRaspberyy Pi Foundation\nhttps://github.com/raspberrypi/hats/blob/master/designguide.md
$EndSCHEMATC
