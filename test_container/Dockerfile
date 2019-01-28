FROM mksec/debian-systemd:stretch

RUN useradd -ms /bin/bash pi
RUN apt-get update
RUN apt-get install -y openssh-server
RUN apt-get install -y sudo

RUN adduser pi sudo && echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN apt-get install -y python

EXPOSE 22 80 443

ADD --chown=pi authorized_keys /home/pi/.ssh/authorized_keys
RUN chmod 600 /home/pi/.ssh/authorized_keys; chmod 700 /home/pi/.ssh
