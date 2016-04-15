#!/bin/bash
#
# Installer script for aeroPi
#
# Author: Clément de l'Hamaide
# Date: April 2016


echo "Welcome to aeroPi installer"
echo "###########################"

echo "raspi-config will be launched, then expand filesystem and change user password"
echo "Then reboot the RPi"
read -p "Continue the script? <Y/n> " prompt
if [[ $prompt =~ [nN](o)* ]]
then
  exit 0
fi

echo "Setting hostname..."
sudo sh -c "echo aeroPi > /etc/hostname"

echo "Installing dependencies..."
sudo apt-get install gpsd gpsd-clients python-gps i2c-tools

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

sudo sh -c "echo '' >> /boot/config.txt"
sudo sh -c "echo '#Fix for GPS on RPi3' >> /boot/config.txt"
sudo sh -c "echo 'enable_uart=1' >> /boot/config.txt"

echo "Done"
