#!/bin/bash
#
# Installer script for aeroPi
#
# Author: Clément de l'Hamaide
# Date: April 2016


echo "Welcome to aeroPi installer"
echo "###########################"

echo "raspi-config will be launched, then  and expand filesystem"
echo "Then reboot the RPi"
read -p "Continue the script? <Y/n> " prompt
if [[ $prompt =~ [nN](o)* ]]
then
  exit 0
fi

echo "Setting hostname..."
sudo echo "aeroPi" > /etc/hostname

echo "Setting new password for Pi user..."
passwd

echo "Installing dependencies..."
sudo apt-get install gpsd gpsd-clients python-gps

echo "Update RPi..."
echo "sudo apt-get update"
echo "sudo apt-get dist-upgrade"
echo "sudo apt-get clean"
echo "Then reboot the RPi"
read -p "Continue the script? <Y/n> " prompt
if [[ $prompt =~ [nN](o)* ]]
then
  exit 0
fi

echo "sudo rpi-update"
echo "Then reboot the RPi"
read -p "Continue the script? <Y/n> " prompt
if [[ $prompt =~ [nN](o)* ]]
then
  exit 0
fi

echo "Done"
