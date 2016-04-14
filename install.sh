#!/bin/bash
#
# Installation script for aeroPi
#
# Author: Clément de l'Hamaide
# Date: April 2016


echo "Welcome to aeroPi installer"
echo "Press a key to continue"
read -n 1

echo "Updating RPi..."
sudo apt-get update
sudo apt-get dist-upgrade
sudo rpi-update
sudo apt-get clean

echo "Installing dependencies..."
sudo apt-get install gpsd gpsd-clients python-gps

echo "Done"
