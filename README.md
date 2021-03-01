Développement
=============

Pour modifier Acolock :

La première fois :

```
git clone git@github.com:acolab/acolock.git
cd acolock
./setup
```

Puis pour lancer les serveurs de développement (nécessite [foreman](https://github.com/ddollar/foreman) ou [équivalent](https://github.com/ddollar/foreman#ports)):

```
foreman start
```

Puis aller sur http://localhost:5000/.

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
* changer son nom avec `echo acolock | sudo tee /etc/hostname` et `echo 127.0.1.1	acolock acolock.local | sudo tee -a /etc/hosts`
* ajouter sa clé SSH à partir de son poste avec `ssh-copy-id pi@x.x.x.x` (la connexion par mot de passe sera désactivée pendant l'installation), et éventuellement ajouter la clé SSH d'autres utilisateurs autorisés dans `~pi/.ssh/authorized_keys`

Wifi
----

* [Realtek RTL8188 150M USB WiFi Wireless Adapter](https://www.banggood.com/Realtek-8188-150M-USB-Wi-Fi-Wireless-Adapter-Realtek-RTL8188-Chip-For-Windows-Mac-Linux-p-983419.html?cur_warehouse=CN)
* `sudo raspi-config`
* Network Options
* Wi-fi
* Saisir le SSID et le mot de passe
* paramétrer en IP fixe (c'est lui qui fera DHCP) :
  * IP : 192.168.1.150
  * Masque de sous réseau : 255.255.255.0
  * Passerelle (gateway) : 192.168.1.1 (le routeur 4G)

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

    `ansible-playbook -i ansible/hosts ansible/site.yml`

* déployer l'application, à faire à chaque fois qu'on veut mettre à jour l'application (back ou front) :

    `ansible-playbook -i ansible/hosts ansible/app.yml`

Si c'est la première installation il faut créer un premier compte administrateur :

* aller sur le pi en ssh
* aller dans le répertoire `back`
* créer un fichier `codes.yml` contenant :

```yaml
nom_utilisateur:
  password: mot_de_passe
  admin: true
```

En remplaçant `nom_utilisateur` et `mot_de_passe` par les identifiants du premier compte à créer. Le mot de passe ne restera pas en clair dans le fichier, il sera chiffré lors du premier accès.

L'interface est ensuite accessible sur https://acolock.acolab.fr/

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
* en http : http://test.acolock.acolab.fr:3080/
* en https : https://test.acolock.acolab.fr:3443/

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
* enregistrer et quitter
* vérifier que le token n'expire pas : `python ansible/check_ovh_keys.py` (nécessite un `pip install ovh`)
* lancer `ansible-playbook -i ansible/hosts ansible/certificate.yml`
