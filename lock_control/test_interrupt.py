#!/usr/bin/env python2.7

import RPi.GPIO as GPIO
from time import sleep

GPIO.setmode(GPIO.BCM)

GPIO.setup(23, GPIO.IN, pull_up_down=GPIO.PUD_UP)

print(GPIO.input(23))

while False:
    print(GPIO.input(23))

def callback(channel):
    print("callback")

channel = 23
GPIO.add_event_detect(channel, GPIO.FALLING)
GPIO.add_event_callback(channel, callback)

print("sleep")
sleep(10)
GPIO.remove_event_detect(channel)

n = 0
try:
    print("ready")
    while True:
        channel = GPIO.wait_for_edge(23, GPIO.FALLING, timeout=1000)
        if channel is None:
            print("timeout")
        else:
            n += 1
            print(n)
except KeyboardInterrupt:
    pass

GPIO.cleanup()
