Installation
============

Système
-------

* Télécharger RASPBIAN STRETCH LITE : https://www.raspberrypi.org/downloads/raspbian/
* `unzip 2018-11-13-raspbian-stretch-lite.zip`
* `sudo dd if=2018-11-13-raspbian-stretch-lite.img of=/dev/sdX bs=4M conv=fsync`
* monter la partition "boot" de la carte SD
* créer un fichier "ssh" à la racine de "boot"
* mettre la carte sur le raspberry, le relier au réseau (carte wifi ou cable) et le démarrer
* trouver son IP (`fping -ag 192.168.1.0/24 2>/dev/null` pour lister les ip locales)
* aller dessus avec `ssh pi@x.x.x.x`, mot de passe `raspberry`
* changer le mot de passe avec `passwd`
* changer son nom avec `echo acolock | sudo tee /etc/hostname` et `echo 127.0.1.1	acolock | sudo tee -a /etc/hosts`
* lui mettre son ip fixe en mettant dans `/etc/dhcpcd.conf` :
```
interface eth0
static ip_address=192.168.1.150/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8
```
* le redémarrer 

Wifi
----

* [Realtek RTL8188 150M USB WiFi Wireless Adapter](https://www.banggood.com/Realtek-8188-150M-USB-Wi-Fi-Wireless-Adapter-Realtek-RTL8188-Chip-For-Windows-Mac-Linux-p-983419.html?cur_warehouse=CN)
* `sudo raspi-config`
* Network Options
* Wi-fi
* Saisir le SSID et le mot de passe

Dépendances pour le scan de QR Code
-----------------------------------

* `apt-get install python-opencv libzbar0 python-picamera`
* `pip install pyzbar`


Dépendances pour le back
------------------------

* `apt-get install nginx`

Création du certificat pour l'HTTPS :

* sur le compte OVH activer le mode développeur dans les paramètres avancés
* en root sur le pi (`sudo -s`) :
* `curl https://get.acme.sh | sh`
* `source ~/.acme.sh/acme.sh.env`
* suivre les instructions de https://github.com/Neilpang/acme.sh/wiki/How-to-use-OVH-domain-api :
    * générer une application sur https://eu.api.ovh.com/createApp/
    * puis sur le pi
    * `read OVH_AK` et saisir l'application key
    * `read OVH_AS` et saisir la secret key
    * `export OVH_AK OVH_AS`
    * `acme.sh --issue -d acolock.acolab.fr --dns dns_ovh`
    * suivre le lien indiqué et saisir les identifiants et une durée "Unlimited"
    * relancer la dernière commande
* suivre les instructions pour installer le certificat sur nginx (https://github.com/Neilpang/acme.sh#3-install-the-cert-to-apachenginx-etc) :
    * `acme.sh --install-cert -d acolock.acolab.fr --key-file /root/.acme.sh/acolock.acolab.fr/acolock.acolab.fr.key --fullchain-file /root/.acme.sh/acolock.acolab.fr/fullchain.cer --reloadcmd "service nginx force-reload"`

Configuration de nginx :

En root sur le pi :

* supprimer le site par défaut nginx : `rm /etc/nginx/sites-enabled/default`
* to be continued
