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

Ansible
-------

La configuration du pi se fait avec Ansible, à installer avec `sudo apt-get install ansible` sur Debian et dérivées.

Création du certificat HTTPS sur le pi
--------------------------------------

Vous devez pouvoir déchiffrer `ansible/vault_passphrase.gpg` pour créer le certificat. Essayez avec `ansible/vault_pass.sh`. Si ça ne fonctionne pas demandez à l'une des personnes autorisées de vous aider. Vous pouvez avoir la liste des clés autorisées avec la commande `gpg --batch --list-packets ansible/vault_passphrase.gpg`.

* `ansible-playbook -i ansible/hosts ansible/certificate.yml`

La création du certificat prend 2-3 minutes à cause des délais DNS.

Préparation du serveur
----------------------

Toutes les opérations sont à faire sur son poste de travail (pas sur le pi) :

* préparer le serveur, à faire une seule fois ou quand on change la configuration système

    ansible-playbook -i ansible/hosts ansible/site.yml

* déployer l'application, à faire à chaque fois qu'on veut mettre à jour l'application (back ou front) :

    ansible-playbook -i ansible/hosts ansible/app.yml

Tester dans un container local
------------------------------

L'installation peut être faite dans un container docker. C'est utile pour tester le déploiement sans toucher au pi.

* installer `docker`
* créer le container : `test_container/run`. Si vous l'avez déjà fait il vous dira qu'il existe déjà, vous pouvez :
    * soit relancer celui qui existe : `docker restart acolock`
    * soit supprimer l'ancien et recommencer : `docker rm -f acolock`

Pour tester le déploiement il faut lancer les commandes `ansible` avec `-i ansible/test_hosts` au lieu de `-i ansible/hosts`.

Puis pour se connecter :
* en ssh : `ssh -p 3022 pi@localhost`
* en http : http://localhost:3080/
* en https : http://localhost:3443/

Dépendances pour le scan de QR Code
-----------------------------------

* `apt-get install python-opencv libzbar0 python-picamera`
* `pip install pyzbar`


Configuration de nginx :

En root sur le pi :

* supprimer le site par défaut nginx : `rm /etc/nginx/sites-enabled/default`
* to be continued

Regénérer les clés API OVH
--------------------------

Normalement ce n'est nécessaire que si on perd les clés existantes ou qu'il faut les regénérer.

* sur le compte OVH activer le mode développeur dans les paramètres avancés
* aller sur https://api.ovh.com/createToken/?GET=/domain/zone/acolab.fr/*&POST=/domain/zone/acolab.fr/*&PUT=/domain/zone/acolab.fr/*&GET=/domain/zone/acolab.fr&DELETE=/domain/zone/acolab.fr/record/*
* saisir l'identifiant et mot de passe du compte OVH ACoLab (RAxx)
* mettre un nom et description pour le script (ACoLock)
* mettre "Unlimited"
* valider
* lancer `ansible-vault edit ansible/ovh_keys.yml`
* modifer les variables avec les clés fournies par OVH

