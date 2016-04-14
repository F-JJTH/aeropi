#!/bin/bash
#
# Installation script for aeroPi
#
# Author: Clément de l'Hamaide
# Date: April 2016


echo "Welcome to aeroPi installer"
echo "Press a key to continue"
read -n 1

echo "Installing package dependencies..."
sudo apt-get install gpsd gpsd-clients python-gps

echo "Done"
