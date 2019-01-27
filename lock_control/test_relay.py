#!/usr/bin/env python2.7

import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)

relay1 = 18
relay2 = 27
relay3 = 22
relay4 = 23

GPIO.setup(relay1, GPIO.OUT)
GPIO.setup(relay2, GPIO.OUT)
GPIO.setup(relay3, GPIO.OUT)
GPIO.setup(relay4, GPIO.OUT)

def relay_on(relay):
    GPIO.output(relay, GPIO.LOW)

def relay_off(relay):
    GPIO.output(relay, GPIO.HIGH)

relay_off(relay1)
relay_off(relay2)
relay_off(relay3)
relay_off(relay4)

try:
    while True:
        print("fermeture")
        relay_on(relay3)
        sleep(3)
        relay_off(relay3)
        sleep(1)
        print("ouverture")
        relay_on(relay4)
        sleep(3)
        relay_off(relay4)
        sleep(1)
except KeyboardInterrupt:
    pass

relay_off(relay1)
relay_off(relay2)
relay_off(relay3)
relay_off(relay4)

GPIO.cleanup()
