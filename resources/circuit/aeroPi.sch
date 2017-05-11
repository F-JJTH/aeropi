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
LIBS:aeroPi-cache
EELAYER 25 0
EELAYER END
$Descr A3 16535 11693
encoding utf-8
Sheet 1 3
Title "aeroPi"
Date "2017-03-05"
Rev "1.0.0"
Comp "Clément de l'Hamaide"
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L Raspberry_Pi_+_Conn P3
U 1 1 54E92361
P 5750 3900
F 0 "P3" H 4650 5850 60  0000 C CNN
F 1 "Raspberry_Pi_+_Conn" H 6050 2450 60  0000 C CNN
F 2 "w_conn_strip:vasch_strip_20x2" H 5750 3900 60  0001 C CNN
F 3 "" H 5750 3900 60  0000 C CNN
F 4 "517-30340-6002" H 5750 3900 60  0001 C CNN "Mouser Part No."
	1    5750 3900
	-1   0    0    -1  
$EndComp
$Comp
L CAT24C32HU4I-GT3 U2
U 1 1 54E93419
P 3000 4200
F 0 "U2" H 2900 4350 60  0000 C CNN
F 1 "CAT24C32HU4I-GT3" H 3400 3400 60  0000 C CNN
F 2 "w_smd_dil:tssop-8" H 3000 4200 60  0001 C CNN
F 3 "" H 3000 4200 60  0000 C CNN
F 4 "698-CAT24C32YI-GT3" H 3000 4200 60  0001 C CNN "Mouser Part No."
	1    3000 4200
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR01
U 1 1 54E93493
P 3900 5100
F 0 "#PWR01" H 3900 5100 30  0001 C CNN
F 1 "GND" H 3900 5030 30  0001 C CNN
F 2 "" H 3900 5100 60  0000 C CNN
F 3 "" H 3900 5100 60  0000 C CNN
	1    3900 5100
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR02
U 1 1 54E93549
P 2400 5100
F 0 "#PWR02" H 2400 5100 30  0001 C CNN
F 1 "GND" H 2400 5030 30  0001 C CNN
F 2 "" H 2400 5100 60  0000 C CNN
F 3 "" H 2400 5100 60  0000 C CNN
	1    2400 5100
	1    0    0    -1  
$EndComp
$Comp
L R R1
U 1 1 54E935B8
P 2000 4450
F 0 "R1" V 2080 4450 40  0000 C CNN
F 1 "1k" V 2007 4451 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 1930 4450 30  0001 C CNN
F 3 "" H 2000 4450 30  0000 C CNN
F 4 "754-RR0510P-102D" V 2000 4450 60  0001 C CNN "Mouser Part No."
	1    2000 4450
	1    0    0    -1  
$EndComp
$Comp
L CONN_01X02 P1
U 1 1 54E93748
P 950 4800
F 0 "P1" H 950 4950 50  0000 C CNN
F 1 "CONN_01X02" V 1050 4800 50  0000 C CNN
F 2 "w_pin_strip:pin_strip_2" H 950 4800 60  0001 C CNN
F 3 "" H 950 4800 60  0000 C CNN
	1    950  4800
	-1   0    0    1   
$EndComp
$Comp
L R R3
U 1 1 54E93F03
P 3850 3800
F 0 "R3" V 3930 3800 40  0000 C CNN
F 1 "3.9k" V 3857 3801 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 3780 3800 30  0001 C CNN
F 3 "" H 3850 3800 30  0000 C CNN
F 4 "71-CRCW04023K90FKED" V 3850 3800 60  0001 C CNN "Mouser Part No."
	1    3850 3800
	1    0    0    -1  
$EndComp
$Comp
L R R5
U 1 1 54E93F5E
P 4100 3800
F 0 "R5" V 4180 3800 40  0000 C CNN
F 1 "3.9k" V 4107 3801 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 4030 3800 30  0001 C CNN
F 3 "" H 4100 3800 30  0000 C CNN
F 4 "71-CRCW04023K90FKED" V 4100 3800 60  0001 C CNN "Mouser Part No."
	1    4100 3800
	1    0    0    -1  
$EndComp
$Comp
L JUMPER-RESCUE-pihat_template JP1
U 1 1 54E9499A
P 1600 5000
F 0 "JP1" H 1600 5150 60  0000 C CNN
F 1 "JUMPER" H 1600 4920 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" H 1600 5000 60  0001 C CNN
F 3 "" H 1600 5000 60  0000 C CNN
	1    1600 5000
	1    0    0    1   
$EndComp
$Comp
L GND #PWR03
U 1 1 54E963F9
P 4500 3600
F 0 "#PWR03" H 4500 3600 30  0001 C CNN
F 1 "GND" H 4500 3530 30  0001 C CNN
F 2 "" H 4500 3600 60  0000 C CNN
F 3 "" H 4500 3600 60  0000 C CNN
	1    4500 3600
	1    0    0    -1  
$EndComp
$Comp
L LM3489 U1
U 1 1 54E983ED
P 2550 9650
F 0 "U1" H 2150 9700 60  0000 C CNN
F 1 "LM3489" H 3050 9050 60  0000 C CNN
F 2 "w_smd_dil:msoic-8" H 2550 9650 60  0001 C CNN
F 3 "" H 2550 9650 60  0000 C CNN
F 4 "926-LM3489MM/NOPB" H 2550 9650 60  0001 C CNN "Mouser Part No."
	1    2550 9650
	1    0    0    -1  
$EndComp
$Comp
L R R2
U 1 1 54E985D4
P 1700 9350
F 0 "R2" V 1780 9350 40  0000 C CNN
F 1 "24k" V 1707 9351 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 1630 9350 30  0001 C CNN
F 3 "" H 1700 9350 30  0000 C CNN
F 4 "71-CRCW0402-24K-E3" V 1700 9350 60  0001 C CNN "Mouser Part No."
	1    1700 9350
	1    0    0    -1  
$EndComp
$Comp
L C C2
U 1 1 54E98A38
P 1250 10200
F 0 "C2" H 1250 10300 40  0000 L CNN
F 1 "0.1uf" H 1256 10115 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 1288 10050 30  0001 C CNN
F 3 "" H 1250 10200 60  0000 C CNN
F 4 "810-C1005X5R1H104K" H 1250 10200 60  0001 C CNN "Mouser Part No."
	1    1250 10200
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR04
U 1 1 54E98C85
P 1250 10750
F 0 "#PWR04" H 1250 10750 30  0001 C CNN
F 1 "GND" H 1250 10680 30  0001 C CNN
F 2 "" H 1250 10750 60  0000 C CNN
F 3 "" H 1250 10750 60  0000 C CNN
	1    1250 10750
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR05
U 1 1 54E98DFB
P 2750 10750
F 0 "#PWR05" H 2750 10750 30  0001 C CNN
F 1 "GND" H 2750 10680 30  0001 C CNN
F 2 "" H 2750 10750 60  0000 C CNN
F 3 "" H 2750 10750 60  0000 C CNN
	1    2750 10750
	1    0    0    -1  
$EndComp
$Comp
L CP C1
U 1 1 54E990D4
P 800 9300
F 0 "C1" H 850 9400 40  0000 L CNN
F 1 "50uf/50v" H 850 9200 40  0000 L CNN
F 2 "w_smd_cap:c_elec_6.3x7.7" H 900 9150 30  0001 C CNN
F 3 "" H 800 9300 300 0000 C CNN
F 4 "647-UUR1H470MCL6GS" H 800 9300 60  0001 C CNN "Mouser Part No."
	1    800  9300
	1    0    0    -1  
$EndComp
$Comp
L C C3
U 1 1 54E992BB
P 1450 9350
F 0 "C3" H 1450 9450 40  0000 L CNN
F 1 "1nf" H 1456 9265 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 1488 9200 30  0001 C CNN
F 3 "" H 1450 9350 60  0000 C CNN
F 4 "810-C1005C0G2A102J5C" H 1450 9350 60  0001 C CNN "Mouser Part No."
	1    1450 9350
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR06
U 1 1 54E99B35
P 800 9600
F 0 "#PWR06" H 800 9600 30  0001 C CNN
F 1 "GND" H 800 9530 30  0001 C CNN
F 2 "" H 800 9600 60  0000 C CNN
F 3 "" H 800 9600 60  0000 C CNN
	1    800  9600
	1    0    0    -1  
$EndComp
$Comp
L R R4
U 1 1 54E99E56
P 3600 9350
F 0 "R4" V 3680 9350 40  0000 C CNN
F 1 "270" V 3607 9351 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 3530 9350 30  0001 C CNN
F 3 "" H 3600 9350 30  0000 C CNN
F 4 "667-ERJ-P6WJ271V" V 3600 9350 60  0001 C CNN "Mouser Part No."
	1    3600 9350
	1    0    0    -1  
$EndComp
$Comp
L D_Schottky D1
U 1 1 54E9A29D
P 3900 9350
F 0 "D1" H 3900 9450 40  0000 C CNN
F 1 "DIODESCH" H 3900 9250 40  0000 C CNN
F 2 "w_smd_diode:do214aa" H 3900 9350 60  0001 C CNN
F 3 "" H 3900 9350 60  0000 C CNN
F 4 "512-MBRS140" H 3900 9350 60  0001 C CNN "Mouser Part No."
	1    3900 9350
	0    -1   -1   0   
$EndComp
$Comp
L INDUCTOR-RESCUE-pihat_template L1
U 1 1 54E9A542
P 4300 8850
F 0 "L1" V 4250 8850 40  0000 C CNN
F 1 "22uH" V 4400 8850 40  0000 C CNN
F 2 "w_smd_inductors:inductor_smd_8x5mm" H 4300 8850 60  0001 C CNN
F 3 "" H 4300 8850 60  0000 C CNN
F 4 "652-SRN8040-220M" V 4300 8850 60  0001 C CNN "Mouser Part No."
	1    4300 8850
	0    -1   -1   0   
$EndComp
$Comp
L R R6
U 1 1 54E9A686
P 4750 9350
F 0 "R6" V 4830 9350 40  0000 C CNN
F 1 "30k" V 4757 9351 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 4680 9350 30  0001 C CNN
F 3 "" H 4750 9350 30  0000 C CNN
F 4 "594-MCT06030C3002FP5" V 4750 9350 60  0001 C CNN "Mouser Part No."
	1    4750 9350
	1    0    0    -1  
$EndComp
$Comp
L R R7
U 1 1 54E9A704
P 4750 10300
F 0 "R7" V 4830 10300 40  0000 C CNN
F 1 "10k" V 4757 10301 40  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 4680 10300 30  0001 C CNN
F 3 "" H 4750 10300 30  0000 C CNN
F 4 "71-CRCW0603-10K-E3" V 4750 10300 60  0001 C CNN "Mouser Part No."
	1    4750 10300
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR07
U 1 1 54E9A81E
P 4750 10750
F 0 "#PWR07" H 4750 10750 30  0001 C CNN
F 1 "GND" H 4750 10680 30  0001 C CNN
F 2 "" H 4750 10750 60  0000 C CNN
F 3 "" H 4750 10750 60  0000 C CNN
	1    4750 10750
	1    0    0    -1  
$EndComp
$Comp
L FDC5614P U3
U 1 1 54E9C27B
P 2950 9000
F 0 "U3" H 2800 9250 60  0000 C CNN
F 1 "FDC5614P" H 2950 8750 60  0000 C CNN
F 2 "w_smd_trans:sot23-6" H 2800 9150 60  0001 C CNN
F 3 "" H 2800 9150 60  0000 C CNN
F 4 "512-FDC5614P" H 2950 9000 60  0001 C CNN "Mouser Part No."
	1    2950 9000
	-1   0    0    -1  
$EndComp
$Comp
L +24V #PWR08
U 1 1 54F050C6
P 800 8700
F 0 "#PWR08" H 800 8650 20  0001 C CNN
F 1 "+24V" H 800 8850 30  0000 C CNN
F 2 "" H 800 8700 60  0000 C CNN
F 3 "" H 800 8700 60  0000 C CNN
	1    800  8700
	1    0    0    -1  
$EndComp
$Sheet
S 3100 2000 1250 200 
U 54F145DC
F0 "Back Power Protection" 47
F1 "Ideal_Diode.sch" 47
F2 "5V_SUPPLY" I L 3100 2100 60 
F3 "5V_MCU" I R 4350 2100 60 
$EndSheet
Text Notes 3000 1450 0    157  Italic 31
Raspberry Pi Connection
Text Notes 1600 6350 0    157  Italic 31
Power Managment Module
$Comp
L LM1117IMPX-ADJ U4
U 1 1 54F307E9
P 1600 7200
F 0 "U4" H 1350 7500 60  0000 C CNN
F 1 "LM1117IMPX-ADJ" H 2050 6900 60  0000 C CNN
F 2 "w_smd_trans:sot223" H 1600 7150 60  0001 C CNN
F 3 "" H 1600 7150 60  0000 C CNN
F 4 "926-M1117IMPXADJNOPB" H 1600 7200 60  0001 C CNN "Mouser Part No."
	1    1600 7200
	1    0    0    -1  
$EndComp
$Comp
L CP C6
U 1 1 54F356B7
P 850 7550
F 0 "C6" H 900 7650 50  0000 L CNN
F 1 "10uf/6.3V" H 900 7450 50  0000 L CNN
F 2 "Capacitors_SMD:CP_Elec_4x5.3" H 950 7400 30  0001 C CNN
F 3 "" H 850 7550 300 0000 C CNN
F 4 "5985-AVS16V100-F" H 850 7550 60  0001 C CNN "Mouser Part No."
	1    850  7550
	1    0    0    -1  
$EndComp
$Comp
L R R8
U 1 1 54F36302
P 1600 8200
F 0 "R8" V 1680 8200 50  0000 C CNN
F 1 "390" V 1607 8201 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 1530 8200 30  0001 C CNN
F 3 "" H 1600 8200 30  0000 C CNN
F 4 "594-MCT06030C3900FP5" V 1600 8200 60  0001 C CNN "Mouser Part No."
	1    1600 8200
	1    0    0    -1  
$EndComp
$Comp
L R R9
U 1 1 54F36377
P 2650 7500
F 0 "R9" V 2730 7500 50  0000 C CNN
F 1 "240" V 2657 7501 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 2580 7500 30  0001 C CNN
F 3 "" H 2650 7500 30  0000 C CNN
F 4 "754-RR0816P-241D" V 2650 7500 60  0001 C CNN "Mouser Part No."
	1    2650 7500
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR09
U 1 1 54F37150
P 1600 8550
F 0 "#PWR09" H 1600 8550 30  0001 C CNN
F 1 "GND" H 1600 8480 30  0001 C CNN
F 2 "" H 1600 8550 60  0000 C CNN
F 3 "" H 1600 8550 60  0000 C CNN
	1    1600 8550
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR010
U 1 1 54F379A8
P 850 7950
F 0 "#PWR010" H 850 7950 30  0001 C CNN
F 1 "GND" H 850 7880 30  0001 C CNN
F 2 "" H 850 7950 60  0000 C CNN
F 3 "" H 850 7950 60  0000 C CNN
	1    850  7950
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR011
U 1 1 54F3D72C
P 3400 8000
F 0 "#PWR011" H 3400 8000 30  0001 C CNN
F 1 "GND" H 3400 7930 30  0001 C CNN
F 2 "" H 3400 8000 60  0000 C CNN
F 3 "" H 3400 8000 60  0000 C CNN
	1    3400 8000
	1    0    0    -1  
$EndComp
$Comp
L LED-RESCUE-pihat_template D3
U 1 1 54F3E98A
P 4050 7450
F 0 "D3" H 4050 7550 50  0000 C CNN
F 1 "LED" H 4050 7350 50  0000 C CNN
F 2 "Diodes_SMD:D_0603" H 4050 7450 60  0001 C CNN
F 3 "" H 4050 7450 60  0000 C CNN
F 4 "743-HT-191USD" H 4050 7450 60  0001 C CNN "Mouser Part No."
	1    4050 7450
	0    1    1    0   
$EndComp
$Comp
L R R10
U 1 1 54F40F53
P 4050 8100
F 0 "R10" V 4130 8100 50  0000 C CNN
F 1 "360" V 4057 8101 50  0000 C CNN
F 2 "Resistors_SMD:R_0603" V 3980 8100 30  0001 C CNN
F 3 "" H 4050 8100 30  0000 C CNN
F 4 "71-CRCW0603316RFKEB" V 4050 8100 60  0001 C CNN "Mouser Part No."
	1    4050 8100
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR012
U 1 1 54F4127D
P 4050 8500
F 0 "#PWR012" H 4050 8500 30  0001 C CNN
F 1 "GND" H 4050 8430 30  0001 C CNN
F 2 "" H 4050 8500 60  0000 C CNN
F 3 "" H 4050 8500 60  0000 C CNN
	1    4050 8500
	1    0    0    -1  
$EndComp
Text Notes 2500 8650 0    60   ~ 0
5v @ 2.1A DC/DC supply
Text Notes 1950 6800 0    60   ~ 0
3.3v @ 1.5A LDO supply
$Comp
L C C5
U 1 1 54EE7CB1
P 4500 9350
F 0 "C5" H 4500 9450 40  0000 L CNN
F 1 "0.1uf" H 4506 9265 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 4538 9200 30  0001 C CNN
F 3 "" H 4500 9350 60  0000 C CNN
F 4 "810-C1005X5R1H104K" H 4500 9350 60  0001 C CNN "Mouser Part No."
	1    4500 9350
	1    0    0    -1  
$EndComp
$Comp
L C C7
U 1 1 54EE8291
P 3000 7450
F 0 "C7" H 3000 7550 40  0000 L CNN
F 1 "0.1uf" H 3006 7365 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 3038 7300 30  0001 C CNN
F 3 "" H 3000 7450 60  0000 C CNN
F 4 "810-C1005X5R1H104K" H 3000 7450 60  0001 C CNN "Mouser Part No."
	1    3000 7450
	1    0    0    -1  
$EndComp
$Comp
L CONN_01X02 P2
U 1 1 54F65B78
P 1350 6350
F 0 "P2" H 1350 6500 50  0000 C CNN
F 1 "CONN_01X02" V 1450 6350 50  0000 C CNN
F 2 "w_conn_mkds:mkds_1,5-2" H 1350 6350 60  0001 C CNN
F 3 "" H 1350 6350 60  0000 C CNN
F 4 "651-1904383" H 1350 6350 60  0001 C CNN "Mouser Part No."
	1    1350 6350
	1    0    0    -1  
$EndComp
$Comp
L +24V #PWR013
U 1 1 54F662FB
P 1050 6150
F 0 "#PWR013" H 1050 6100 20  0001 C CNN
F 1 "+24V" H 1050 6300 30  0000 C CNN
F 2 "" H 1050 6150 60  0000 C CNN
F 3 "" H 1050 6150 60  0000 C CNN
	1    1050 6150
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR014
U 1 1 54F66353
P 1050 6550
F 0 "#PWR014" H 1050 6550 30  0001 C CNN
F 1 "GND" H 1050 6480 30  0001 C CNN
F 2 "" H 1050 6550 60  0000 C CNN
F 3 "" H 1050 6550 60  0000 C CNN
	1    1050 6550
	1    0    0    -1  
$EndComp
$Comp
L C C4
U 1 1 551D5AC8
P 2350 4500
F 0 "C4" H 2350 4600 40  0000 L CNN
F 1 "0.1uf" H 2356 4415 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 2388 4350 30  0001 C CNN
F 3 "" H 2350 4500 60  0000 C CNN
F 4 "810-C1005X5R1H104K" H 2350 4500 60  0001 C CNN "Mouser Part No."
	1    2350 4500
	1    0    0    -1  
$EndComp
$Comp
L C C8
U 1 1 567BDDCB
P 3400 7450
F 0 "C8" H 3400 7550 40  0000 L CNN
F 1 "1uf" H 3406 7365 40  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 3438 7300 30  0001 C CNN
F 3 "" H 3400 7450 60  0000 C CNN
F 4 "810-C1005X5R1H104K" H 3400 7450 60  0001 C CNN "Mouser Part No."
	1    3400 7450
	1    0    0    -1  
$EndComp
$Comp
L FGPMMOPA6H U6
U 1 1 58BCBCD2
P 7150 6850
F 0 "U6" H 6750 7500 60  0000 C CNN
F 1 "FGPMMOPA6H" H 7200 7400 60  0000 C CNN
F 2 "aeroPi:PA6H" H 7150 7050 60  0001 C CNN
F 3 "" H 7150 7050 60  0001 C CNN
	1    7150 6850
	1    0    0    -1  
$EndComp
NoConn ~ 7850 6400
NoConn ~ 7850 6600
NoConn ~ 7850 6700
NoConn ~ 7850 6800
NoConn ~ 7850 6900
NoConn ~ 6450 6900
NoConn ~ 6450 7000
NoConn ~ 6450 6500
$Comp
L GND #PWR015
U 1 1 58BCBCD4
P 6000 7150
F 0 "#PWR015" H 6000 6900 50  0001 C CNN
F 1 "GND" H 6000 7000 50  0000 C CNN
F 2 "" H 6000 7150 50  0001 C CNN
F 3 "" H 6000 7150 50  0001 C CNN
	1    6000 7150
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR016
U 1 1 58BCBCD5
P 5950 6600
F 0 "#PWR016" H 5950 6350 50  0001 C CNN
F 1 "GND" H 5950 6450 50  0000 C CNN
F 2 "" H 5950 6600 50  0001 C CNN
F 3 "" H 5950 6600 50  0001 C CNN
	1    5950 6600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR017
U 1 1 58BCBCD6
P 8400 6500
F 0 "#PWR017" H 8400 6250 50  0001 C CNN
F 1 "GND" H 8400 6350 50  0000 C CNN
F 2 "" H 8400 6500 50  0001 C CNN
F 3 "" H 8400 6500 50  0001 C CNN
	1    8400 6500
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR018
U 1 1 58BCBCD7
P 8400 7200
F 0 "#PWR018" H 8400 6950 50  0001 C CNN
F 1 "GND" H 8400 7050 50  0000 C CNN
F 2 "" H 8400 7200 50  0001 C CNN
F 3 "" H 8400 7200 50  0001 C CNN
	1    8400 7200
	1    0    0    -1  
$EndComp
NoConn ~ 7850 7000
$Comp
L LED_Small D2
U 1 1 58BCBCD8
P 6050 6900
F 0 "D2" H 6100 6850 50  0000 L CNN
F 1 "3D FIX" H 6050 6800 35  0000 C CNN
F 2 "Diodes_SMD:D_0603" V 6050 6900 50  0001 C CNN
F 3 "" V 6050 6900 50  0001 C CNN
	1    6050 6900
	1    0    0    -1  
$EndComp
$Comp
L R_Small R13
U 1 1 58BCBCD9
P 5800 6900
F 0 "R13" V 5731 6900 50  0000 C CNN
F 1 "470" V 5839 6900 35  0000 C TNN
F 2 "Resistors_SMD:R_0603" H 5800 6900 50  0001 C CNN
F 3 "" H 5800 6900 50  0001 C CNN
	1    5800 6900
	0    1    1    0   
$EndComp
Text Label 6450 6700 2    35   ~ 0
VBACKUP
$Comp
L CONN_COAXIAL J1
U 1 1 58BCBCDB
P 8100 7300
F 0 "J1" H 8100 7550 50  0000 C CNN
F 1 "CONN_COAXIAL" H 8100 7450 50  0000 C CNN
F 2 "Connectors_Molex:Molex_Microcoaxial_RF" H 8100 7300 50  0001 C CNN
F 3 "" H 8100 7300 50  0001 C CNN
	1    8100 7300
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR019
U 1 1 58BCBCDC
P 8100 7550
F 0 "#PWR019" H 8100 7300 50  0001 C CNN
F 1 "GND" H 8100 7400 50  0000 C CNN
F 2 "" H 8100 7550 50  0001 C CNN
F 3 "" H 8100 7550 50  0001 C CNN
	1    8100 7550
	1    0    0    -1  
$EndComp
NoConn ~ 7850 7100
$Comp
L PWR_FLAG #FLG020
U 1 1 58BD447B
P 4550 6700
F 0 "#FLG020" H 4550 6775 50  0001 C CNN
F 1 "PWR_FLAG" H 4550 6850 50  0000 C CNN
F 2 "" H 4550 6700 50  0001 C CNN
F 3 "" H 4550 6700 50  0001 C CNN
	1    4550 6700
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG021
U 1 1 58BD44DD
P 5100 6700
F 0 "#FLG021" H 5100 6775 50  0001 C CNN
F 1 "PWR_FLAG" H 5100 6850 50  0000 C CNN
F 2 "" H 5100 6700 50  0001 C CNN
F 3 "" H 5100 6700 50  0001 C CNN
	1    5100 6700
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR022
U 1 1 58BD4648
P 5100 6700
F 0 "#PWR022" H 5100 6700 30  0001 C CNN
F 1 "GND" H 5100 6630 30  0001 C CNN
F 2 "" H 5100 6700 60  0000 C CNN
F 3 "" H 5100 6700 60  0000 C CNN
	1    5100 6700
	1    0    0    -1  
$EndComp
$Comp
L +24V #PWR023
U 1 1 58BD46C2
P 4550 6700
F 0 "#PWR023" H 4550 6650 20  0001 C CNN
F 1 "+24V" H 4550 6850 30  0000 C CNN
F 2 "" H 4550 6700 60  0000 C CNN
F 3 "" H 4550 6700 60  0000 C CNN
	1    4550 6700
	-1   0    0    1   
$EndComp
NoConn ~ 1800 10050
NoConn ~ 4650 2450
NoConn ~ 4650 2550
NoConn ~ 7200 5200
NoConn ~ 7200 5100
NoConn ~ 7200 5000
NoConn ~ 7200 4900
NoConn ~ 7200 4800
NoConn ~ 7200 4700
NoConn ~ 7200 4600
NoConn ~ 7200 4500
NoConn ~ 7200 4400
NoConn ~ 7200 4300
NoConn ~ 7200 4200
NoConn ~ 7200 4100
NoConn ~ 7200 4000
NoConn ~ 7200 3900
NoConn ~ 7200 2100
NoConn ~ 7200 2200
Text Label 7200 2450 0    60   ~ 0
RXD
Text Label 7200 2550 0    60   ~ 0
TXD
Text Label 6350 7350 3    60   ~ 0
TXD
Text Label 6200 7250 3    60   ~ 0
RXD
$Comp
L GND #PWR024
U 1 1 58BDF5E8
P 5750 7750
F 0 "#PWR024" H 5750 7500 50  0001 C CNN
F 1 "GND" H 5750 7600 50  0000 C CNN
F 2 "" H 5750 7750 50  0001 C CNN
F 3 "" H 5750 7750 50  0001 C CNN
	1    5750 7750
	1    0    0    -1  
$EndComp
$Comp
L Battery_Cell BT1
U 1 1 58BDFB9F
P 5750 7650
F 0 "BT1" H 5850 7750 50  0000 L CNN
F 1 "Battery_Cell" H 5850 7650 50  0000 L CNN
F 2 "Connectors:CR1220" V 5750 7710 50  0001 C CNN
F 3 "" V 5750 7710 50  0001 C CNN
	1    5750 7650
	1    0    0    -1  
$EndComp
Text Label 5750 7450 1    60   ~ 0
VBACKUP
Text Label 5300 8600 1    60   ~ 0
+5V
Text Label 850  6850 1    60   ~ 0
+5V
Text Label 4050 6850 1    60   ~ 0
+3.3V
Text Label 3000 2100 2    60   ~ 0
+5V
Text Label 2000 3950 1    60   ~ 0
+3.3V
Text Label 4100 3450 1    60   ~ 0
+3.3V
Text Label 5700 6200 1    60   ~ 0
+3.3V
$Comp
L MPU-9250 U7
U 1 1 58BD810A
P 7000 9500
F 0 "U7" H 6550 10250 50  0000 C CNN
F 1 "MPU-9250" H 7300 8750 50  0000 C CNN
F 2 "Housings_DFN_QFN:QFN-24_3x3mm_Pitch0.4mm" H 7000 8500 50  0001 C CNN
F 3 "" H 7000 9350 50  0001 C CNN
	1    7000 9500
	1    0    0    -1  
$EndComp
Text Notes 6450 7850 0    157  Italic 31
GPS Module
Text Label 6300 9200 2    60   ~ 0
MOSI
Text Label 6300 9300 2    60   ~ 0
MISO
Text Label 6300 9400 2    60   ~ 0
SCLK
$Comp
L GND #PWR025
U 1 1 58BEF3EB
P 7000 10600
F 0 "#PWR025" H 7000 10600 30  0001 C CNN
F 1 "GND" H 7000 10530 30  0001 C CNN
F 2 "" H 7000 10600 60  0000 C CNN
F 3 "" H 7000 10600 60  0000 C CNN
	1    7000 10600
	1    0    0    -1  
$EndComp
Text Label 6900 8300 2    60   ~ 0
+3.3V
NoConn ~ 6300 9700
Text Label 7200 3700 0    60   ~ 0
MPU0_ADDR
Text Label 6300 9500 2    60   ~ 0
MPU0_ADDR
$Comp
L C C13
U 1 1 58C813F5
P 8050 10150
F 0 "C13" H 8075 10250 50  0000 L CNN
F 1 "0.1u" H 8075 10050 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 8088 10000 50  0001 C CNN
F 3 "" H 8050 10150 50  0001 C CNN
	1    8050 10150
	-1   0    0    1   
$EndComp
Text Label 7700 9800 0    60   ~ 0
+3.3V
NoConn ~ 7700 9400
NoConn ~ 7700 9500
$Comp
L C C12
U 1 1 58C81EBC
P 7750 8600
F 0 "C12" H 7775 8700 50  0000 L CNN
F 1 "0.1u" H 7775 8500 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 7788 8450 50  0001 C CNN
F 3 "" H 7750 8600 50  0001 C CNN
	1    7750 8600
	1    0    0    -1  
$EndComp
$Comp
L C C10
U 1 1 58C81F51
P 6200 8600
F 0 "C10" H 6225 8700 50  0000 L CNN
F 1 "10n" H 6225 8500 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 6238 8450 50  0001 C CNN
F 3 "" H 6200 8600 50  0001 C CNN
	1    6200 8600
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR026
U 1 1 58C81FE8
P 6200 8800
F 0 "#PWR026" H 6200 8800 30  0001 C CNN
F 1 "GND" H 6200 8730 30  0001 C CNN
F 2 "" H 6200 8800 60  0000 C CNN
F 3 "" H 6200 8800 60  0000 C CNN
	1    6200 8800
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR027
U 1 1 58C82484
P 7750 8800
F 0 "#PWR027" H 7750 8800 30  0001 C CNN
F 1 "GND" H 7750 8730 30  0001 C CNN
F 2 "" H 7750 8800 60  0000 C CNN
F 3 "" H 7750 8800 60  0000 C CNN
	1    7750 8800
	1    0    0    -1  
$EndComp
Text Label 7700 9200 0    60   ~ 0
MPU0_INT
Text Label 7200 3600 0    60   ~ 0
MPU0_INT
Text Notes 5650 10900 0    157  Italic 31
AHRS Module
$Comp
L C C9
U 1 1 58CC52E9
P 6100 6450
F 0 "C9" H 6125 6550 50  0000 L CNN
F 1 "10u" H 6125 6350 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 6138 6300 50  0001 C CNN
F 3 "" H 6100 6450 50  0001 C CNN
	1    6100 6450
	1    0    0    -1  
$EndComp
$Comp
L C C11
U 1 1 58CC5368
P 6300 6450
F 0 "C11" H 6325 6550 50  0000 L CNN
F 1 "0.1u" H 6325 6350 50  0000 L CNN
F 2 "Capacitors_SMD:C_0603" H 6338 6300 50  0001 C CNN
F 3 "" H 6300 6450 50  0001 C CNN
	1    6300 6450
	1    0    0    -1  
$EndComp
$Comp
L Ferrite_Bead_Small L2
U 1 1 58CC6CF4
P 5900 6300
F 0 "L2" V 6100 6250 50  0000 L CNN
F 1 "Ferrite" V 6000 6150 50  0000 L CNN
F 2 "Resistors_SMD:R_0805" V 5830 6300 50  0001 C CNN
F 3 "" H 5900 6300 50  0001 C CNN
	1    5900 6300
	0    -1   -1   0   
$EndComp
$Comp
L Screw_Terminal_1x12 J2
U 1 1 58CC8F45
P 15700 3150
F 0 "J2" H 15700 4400 50  0000 C TNN
F 1 "Screw_Terminal_1x12" V 15550 3150 50  0000 C TNN
F 2 "Connectors_Terminal_Blocks:TerminalBlock_Pheonix_MPT-2.54mm_12pol" H 15700 1925 50  0001 C CNN
F 3 "" H 15675 4150 50  0001 C CNN
	1    15700 3150
	-1   0    0    1   
$EndComp
$Comp
L D_Small D4
U 1 1 58CC93C1
P 10050 10330
F 0 "D4" H 10000 10410 50  0000 L CNN
F 1 "Diode" H 9900 10250 50  0000 L CNN
F 2 "Diodes_SMD:D_0603" V 10050 10330 50  0001 C CNN
F 3 "" V 10050 10330 50  0001 C CNN
	1    10050 10330
	0    1    1    0   
$EndComp
$Comp
L D_Zener_Small D5
U 1 1 58CC9DAC
P 10550 10330
F 0 "D5" H 10550 10420 50  0000 C CNN
F 1 "3.3V" H 10550 10240 50  0000 C CNN
F 2 "Diodes_SMD:D_SOD-323" V 10550 10330 50  0001 C CNN
F 3 "" V 10550 10330 50  0001 C CNN
	1    10550 10330
	0    1    1    0   
$EndComp
$Comp
L R_Small R15
U 1 1 58CC9EF8
P 10300 10150
F 0 "R15" H 10330 10170 50  0000 L CNN
F 1 "100k" H 10330 10110 50  0000 L CNN
F 2 "Resistors_SMD:R_0603" H 10300 10150 50  0001 C CNN
F 3 "" H 10300 10150 50  0001 C CNN
	1    10300 10150
	0    1    1    0   
$EndComp
$Comp
L R_Small R14
U 1 1 58CCA086
P 9800 10150
F 0 "R14" H 9830 10170 50  0000 L CNN
F 1 "10k" H 9830 10110 50  0000 L CNN
F 2 "Resistors_SMD:R_0603" H 9800 10150 50  0001 C CNN
F 3 "" H 9800 10150 50  0001 C CNN
	1    9800 10150
	0    1    1    0   
$EndComp
$Comp
L GND #PWR028
U 1 1 58CCA77F
P 10300 10600
F 0 "#PWR028" H 10300 10600 30  0001 C CNN
F 1 "GND" H 10300 10530 30  0001 C CNN
F 2 "" H 10300 10600 60  0001 C CNN
F 3 "" H 10300 10600 60  0001 C CNN
	1    10300 10600
	1    0    0    -1  
$EndComp
Text Label 9550 10150 2    60   ~ 0
TACH_IN
Text Label 10700 10150 0    60   ~ 0
TACH
Text Notes 9000 10900 0    157  Italic 31
Tachymeter Module
Text Label 15500 2050 2    60   ~ 0
TACH_IN
NoConn ~ 15500 2850
NoConn ~ 15500 3050
NoConn ~ 15500 3250
NoConn ~ 15500 3450
NoConn ~ 15500 3650
NoConn ~ 15500 3850
NoConn ~ 15500 4050
NoConn ~ 15500 4250
Text Label 7100 8300 0    60   ~ 0
+3.3V
Text Label 5100 7250 2    60   ~ 0
+3.3V
Text Label 4550 7250 2    60   ~ 0
+5V
$Comp
L PWR_FLAG #FLG029
U 1 1 58CE60AD
P 4550 7150
F 0 "#FLG029" H 4550 7225 50  0001 C CNN
F 1 "PWR_FLAG" H 4550 7300 50  0000 C CNN
F 2 "" H 4550 7150 50  0001 C CNN
F 3 "" H 4550 7150 50  0001 C CNN
	1    4550 7150
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG030
U 1 1 58CE6314
P 5100 7150
F 0 "#FLG030" H 5100 7225 50  0001 C CNN
F 1 "PWR_FLAG" H 5100 7300 50  0000 C CNN
F 2 "" H 5100 7150 50  0001 C CNN
F 3 "" H 5100 7150 50  0001 C CNN
	1    5100 7150
	1    0    0    -1  
$EndComp
Wire Wire Line
	10550 10500 10550 10430
Wire Wire Line
	10050 10430 10050 10500
Wire Wire Line
	6000 7100 6000 7150
Wire Wire Line
	6350 7300 6450 7300
Wire Wire Line
	6150 6800 6450 6800
Connection ~ 4100 3500
Wire Wire Line
	3850 3500 3850 3650
Wire Wire Line
	4100 3500 3850 3500
Wire Wire Line
	4100 3450 4100 3650
Connection ~ 4100 4300
Wire Wire Line
	4100 3950 4100 4300
Connection ~ 3850 4200
Wire Wire Line
	3850 3950 3850 4200
Wire Wire Line
	3750 4300 4650 4300
Wire Wire Line
	3750 4200 4650 4200
Connection ~ 1250 4750
Wire Wire Line
	1250 5000 1250 4750
Wire Wire Line
	1300 5000 1250 5000
Connection ~ 2000 5000
Wire Wire Line
	2000 4850 2000 5000
Wire Wire Line
	1150 4850 2000 4850
Connection ~ 2000 4750
Wire Wire Line
	2000 4750 2000 4600
Wire Wire Line
	1150 4750 2550 4750
Connection ~ 2000 4050
Wire Wire Line
	2350 4050 2000 4050
Wire Wire Line
	2350 4050 2350 4350
Wire Wire Line
	2550 4200 2350 4200
Wire Wire Line
	2000 3950 2000 4300
Connection ~ 2400 5000
Wire Wire Line
	1900 5000 2400 5000
Wire Wire Line
	2400 4850 2400 5100
Wire Wire Line
	2350 4850 2550 4850
Connection ~ 3900 4750
Wire Wire Line
	3750 4650 3900 4650
Connection ~ 3900 4850
Wire Wire Line
	3750 4750 3900 4750
Wire Wire Line
	3900 4650 3900 5100
Wire Wire Line
	3900 4850 3750 4850
Wire Wire Line
	4500 3500 4650 3500
Wire Wire Line
	4500 2800 4500 3600
Wire Wire Line
	4650 2800 4500 2800
Connection ~ 4500 3500
Wire Wire Line
	4500 3400 4650 3400
Connection ~ 4500 3400
Wire Wire Line
	4500 3300 4650 3300
Connection ~ 4500 3300
Wire Wire Line
	4500 3200 4650 3200
Connection ~ 4500 3200
Wire Wire Line
	4500 3100 4650 3100
Connection ~ 4500 3100
Wire Wire Line
	4500 3000 4650 3000
Connection ~ 4500 3000
Wire Wire Line
	4650 2900 4500 2900
Connection ~ 4500 2900
Wire Wire Line
	4350 2100 4650 2100
Wire Wire Line
	4650 2200 4550 2200
Wire Wire Line
	4550 2200 4550 2100
Connection ~ 4550 2100
Connection ~ 2350 4200
Wire Wire Line
	2350 4650 2350 4850
Connection ~ 2400 4850
Wire Wire Line
	1450 9750 1800 9750
Wire Wire Line
	1700 9500 1700 9750
Wire Wire Line
	1700 8850 1700 9200
Wire Wire Line
	800  8850 2650 8850
Wire Wire Line
	1250 8850 1250 10050
Wire Wire Line
	1250 9900 1800 9900
Connection ~ 1250 9900
Wire Wire Line
	1250 10350 1250 10750
Wire Wire Line
	2750 10500 2750 10750
Wire Wire Line
	3500 10050 3600 10050
Wire Wire Line
	3600 10050 3600 10600
Wire Wire Line
	2750 10600 3900 10600
Connection ~ 2750 10600
Wire Wire Line
	1450 8850 1450 9200
Connection ~ 1450 8850
Wire Wire Line
	1450 9500 1450 9750
Connection ~ 1700 9750
Wire Wire Line
	800  8700 800  9150
Connection ~ 1250 8850
Wire Wire Line
	800  9450 800  9600
Wire Wire Line
	3600 8850 3600 9200
Wire Wire Line
	3600 9750 3500 9750
Wire Wire Line
	3600 9500 3600 9750
Wire Wire Line
	3500 9900 4750 9900
Wire Wire Line
	3250 8850 4000 8850
Wire Wire Line
	3900 8850 3900 9200
Connection ~ 3900 8850
Wire Wire Line
	4750 10450 4750 10750
Wire Wire Line
	4750 9500 4750 10150
Connection ~ 4750 9900
Wire Wire Line
	4750 8850 4750 9200
Wire Wire Line
	4600 8850 5300 8850
Wire Wire Line
	4500 9050 4500 9200
Wire Wire Line
	4500 9050 4750 9050
Connection ~ 4750 9050
Wire Wire Line
	4500 9500 4500 9900
Connection ~ 4500 9900
Wire Wire Line
	3900 10600 3900 9500
Connection ~ 3600 10600
Connection ~ 4750 8850
Wire Wire Line
	2650 9150 2550 9150
Wire Wire Line
	2550 9150 2550 9350
Connection ~ 3600 8850
Wire Wire Line
	3250 8950 3350 8950
Wire Wire Line
	3350 8850 3350 9150
Connection ~ 3350 8850
Wire Wire Line
	3350 9050 3250 9050
Connection ~ 3350 8950
Wire Wire Line
	3350 9150 3250 9150
Connection ~ 3350 9050
Connection ~ 1700 8850
Wire Wire Line
	3000 2100 3100 2100
Wire Wire Line
	5300 8850 5300 8600
Connection ~ 800  8850
Wire Wire Line
	850  6850 850  7400
Connection ~ 850  7050
Wire Wire Line
	2250 7050 4050 7050
Wire Wire Line
	2650 7050 2650 7350
Wire Wire Line
	1600 7750 1600 8050
Wire Wire Line
	2650 7650 2650 7850
Connection ~ 1600 7850
Wire Wire Line
	1600 8350 1600 8550
Wire Wire Line
	850  7700 850  7950
Wire Wire Line
	3000 7050 3000 7300
Connection ~ 2650 7050
Wire Wire Line
	3000 7600 3000 7850
Wire Wire Line
	3400 7050 3400 7300
Connection ~ 3000 7050
Wire Wire Line
	2650 7850 1600 7850
Wire Wire Line
	3400 7600 3400 8000
Wire Wire Line
	3000 7850 3400 7850
Connection ~ 3400 7850
Wire Wire Line
	4050 6850 4050 7250
Connection ~ 3400 7050
Wire Wire Line
	4050 7650 4050 7950
Wire Wire Line
	4050 8250 4050 8500
Connection ~ 4050 7050
Wire Wire Line
	1150 6300 1050 6300
Wire Wire Line
	1050 6300 1050 6150
Wire Wire Line
	1150 6400 1050 6400
Wire Wire Line
	1050 6400 1050 6550
Wire Notes Line
	600  5550 8150 5550
Wire Notes Line
	8150 5550 8150 850 
Wire Notes Line
	8150 850  600  850 
Wire Notes Line
	600  850  600  5550
Wire Notes Line
	650  5950 650  10950
Wire Notes Line
	650  10950 5450 10950
Wire Notes Line
	5450 10950 5450 5950
Wire Notes Line
	5450 5950 650  5950
Wire Wire Line
	1000 7050 850  7050
Wire Wire Line
	7850 7200 8400 7200
Wire Wire Line
	7850 6500 8400 6500
Wire Wire Line
	6450 7100 6000 7100
Wire Wire Line
	6150 6800 6150 6900
Wire Wire Line
	5950 6900 5900 6900
Wire Wire Line
	5700 6200 5700 6900
Wire Wire Line
	8100 7500 8100 7550
Wire Wire Line
	7850 7300 7950 7300
Wire Wire Line
	6200 7200 6450 7200
Wire Wire Line
	6350 7350 6350 7300
Wire Notes Line
	5550 5950 8650 5950
Wire Notes Line
	8650 5950 8650 8000
Wire Notes Line
	8650 8000 5550 8000
Wire Notes Line
	5550 8000 5550 5950
Wire Wire Line
	7000 10400 7000 10600
Wire Wire Line
	7700 9900 7750 9900
Wire Wire Line
	7750 9900 7750 10400
Wire Wire Line
	7000 10400 8050 10400
Wire Wire Line
	7700 9700 8050 9700
Wire Wire Line
	8050 10400 8050 10300
Connection ~ 7750 10400
Wire Wire Line
	8050 9700 8050 10000
Wire Wire Line
	7750 8750 7750 8800
Wire Wire Line
	6200 8800 6200 8750
Connection ~ 6900 8450
Wire Notes Line
	5550 8100 8650 8100
Wire Notes Line
	8650 8100 8650 10950
Wire Notes Line
	8650 10950 5550 10950
Wire Notes Line
	5550 10950 5550 8100
Wire Wire Line
	6000 6300 6450 6300
Connection ~ 6300 6300
Connection ~ 5700 6300
Connection ~ 6100 6300
Wire Wire Line
	6450 6300 6450 6400
Wire Wire Line
	5950 6600 6450 6600
Connection ~ 6300 6600
Connection ~ 6100 6600
Wire Wire Line
	5700 6300 5800 6300
Wire Wire Line
	10050 10500 10550 10500
Wire Wire Line
	10300 10500 10300 10600
Connection ~ 10300 10500
Wire Wire Line
	9900 10150 10200 10150
Wire Wire Line
	10050 10230 10050 10150
Connection ~ 10050 10150
Wire Wire Line
	10400 10150 10700 10150
Wire Wire Line
	10550 10230 10550 10150
Connection ~ 10550 10150
Wire Wire Line
	9700 10150 9550 10150
Wire Notes Line
	8850 10000 11450 10000
Wire Notes Line
	11450 10000 11450 11000
Wire Notes Line
	11450 11000 8850 11000
Wire Notes Line
	8850 11000 8850 10000
Wire Wire Line
	6900 8300 6900 8600
Wire Wire Line
	6900 8450 6200 8450
Wire Wire Line
	7100 8300 7100 8600
Wire Wire Line
	7750 8450 7100 8450
Connection ~ 7100 8450
Wire Wire Line
	4550 7150 4550 7250
Wire Wire Line
	5100 7150 5100 7250
Wire Wire Line
	6200 7200 6200 7250
Wire Wire Line
	7200 2800 9280 2800
Wire Wire Line
	7200 2900 9280 2900
Wire Wire Line
	7200 3000 9280 3000
Wire Wire Line
	7200 3100 9280 3100
Wire Wire Line
	7200 3200 9280 3200
NoConn ~ 15500 2250
NoConn ~ 15500 2450
NoConn ~ 15500 2650
Text Label 7200 2800 0    60   ~ 0
MOSI
Text Label 7200 2900 0    60   ~ 0
MISO
Text Label 7200 3000 0    60   ~ 0
SCLK
Text Label 10160 2900 0    60   ~ 0
+3.3V
Text Label 10160 2800 0    60   ~ 0
+5V
$Sheet
S 9280 2580 750  810 
U 5914C09B
F0 "Analog Sensors" 60
F1 "Analog_Sensors.sch" 60
F2 "CLK" I L 9280 3000 60 
F3 "MISO" I L 9280 2800 60 
F4 "MOSI" I L 9280 2900 60 
F5 "MCP0_ADDR" I L 9280 3100 60 
F6 "MCP1_ADDR" I L 9280 3200 60 
F7 "+5V" I R 10030 2800 60 
F8 "+3.3V" I R 10030 2900 60 
F9 "TACH" I L 9280 3300 60 
$EndSheet
Wire Wire Line
	10030 2800 10160 2800
Wire Wire Line
	10160 2900 10030 2900
Wire Wire Line
	9280 3300 7770 3300
Wire Wire Line
	7770 3300 7770 3800
Wire Wire Line
	7770 3800 7200 3800
$EndSCHEMATC
