Installation
============

* Télécharger RASPBIAN STRETCH LITE : https://www.raspberrypi.org/downloads/raspbian/
* `unzip 2018-11-13-raspbian-stretch-lite.zip`
* `sudo dd if=2018-11-13-raspbian-stretch-lite.img of=/dev/sdX bs=4M conv=fsync`
* monter la partition "boot" de la carte SD
* créer un fichier "ssh" à la racine de "boot"
* mettre la carte sur le raspberry, le relier au réseau (carte wifi ou cable) et le démarrer
* trouver son IP (`fping -ag 192.168.1.0/24 2>/dev/null` pour lister les ip locales)
* aller dessus avec `ssh pi@x.x.x.x`, mot de passe `raspberry`
* changer le mot de passe avec `passwd`
* changer son nom avec `echo acolock | sudo tee /etc/hostname` et `echo 127.0.1.1	acolock | tee -a /etc/hosts`
* lui mettre son ip fixe en mettant dans `/etc/dhcpcd.conf` :
```
interface eth0
static ip_address=192.168.1.150/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```
* le redémarrer 

Installation des dépendances pour le scan de QR Code :

* `apt-get install python-opencv libzbar0 python-picamera`
* `pip install pyzbar`
