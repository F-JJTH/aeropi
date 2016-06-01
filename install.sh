#!/bin/bash
#
# Installer script for aeroPi
#
# Author: Clément de l'Hamaide
# Date: April 2016


echo "Welcome to aeroPi installer"
echo "###########################"


echo "Installation step are:"

echo "1) Run raspi-config"
#echo "   expand filesystem"
echo "   change user password"
echo "   set hostname"
echo "*** Reboot ***"
echo ""

echo "2) Install dependencies"
echo "   sudo apt-get install gpsd gpsd-clients i2c-tools apache2 libapache2-mod-php5"
echo ""

echo "3) Update packages"
echo "   sudo apt-get update"
echo "   sudo apt-get dist-upgrade"
echo "   sudo apt-get clean"
echo "*** Reboot ***"
echo ""

echo "4) Update RPi"
echo "sudo rpi-update"
echo "*** Reboot ***"
echo ""

echo "5) Configure RPi3"
echo "   append  enable_uart=1  to /boot/config.txt"
echo "   append  lcd_rotate=2  to /boot/config.txt"
echo "   append  dtparam=i2c_arm=on  to /boot/config.txt"
echo ""

echo "6) Quiet boot"
echo "   echo 'dwc_otg.lpm_enable=0 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait quiet' > /boot/cmdline.txt"
echo ""

echo "7) Build Python3.5 from source"
url="https://www.python.org/ftp/python/3.5.1/Python-3.5.1.tar.xz"
echo "   sudo apt-get update"
echo "   sudo apt-get install build-essential tk-dev libncurses5-dev libncursesw5-dev libreadline6-dev libdb5.3-dev libgdbm-dev libsqlite3-dev libssl-dev libbz2-dev libexpat1-dev liblzma-dev zlib1g-dev"
echo "   mkdir -p ~/.pip/cache"
echo "   echo '[global]' > ~/.pip/pip.conf"
echo "   echo 'download_cache = ~/.pip/cache' >> ~/.pip/pip.conf"
echo "   wget $url -O python.tar.xz"
echo "   tar xvf python.tar.xz"
echo "   mv Python* python"
echo "   cd python"
echo "   ./configure"
echo "   make -j 4"
echo ""

echo "8) Build RTIMULib2 from source"
echo "   git clone https://github.com/richards-tech/RTIMULib2.git"
echo "   cd RTIMULib2"
echo "   python3 setup.py build"
echo "   sudo python3 setup.py install"
echo ""

echo "9) Setup daemon"
echo "   append  stty -F /dev/ttyS0 raw 9600 cs8 clocal -cstopb  to /etc/rc.local"
echo "   append  python3 /home/pi/aeropi/src/server.py &  to /etc/rc.local"
echo ""

echo "10) Install aeroPi"
echo "    git clone ssh://f-jjth@git.code.sf.net/p/aeropi/code aeropi"
echo "    sudo ln -s /home/pi/aeropi/src/RTIMULib.ini /etc/RTIMULib.ini"
echo ""

dir="~/.config/autostart"
echo "11) Create autostart app"
echo "    mkdir -p $dir"
echo "    echo '[Desktop Entry]' > $dir/aeropi.desktop"
echo "    echo 'Name=aeropi' >> $dir/aeropi.desktop"
echo "    echo 'Exec=epiphany http://localhost/' >> $dir/aeropi.desktop"
echo "    echo 'Type=Application' >> $dir/aeropi.desktop"
echo ""

echo "12) Configure Apache2"
echo "    localhost:80 must point to aeropi/www"
echo ""

echo "Done"
