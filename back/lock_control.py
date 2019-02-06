#!/usr/bin/env python

import time
import sys
from ilock import ILock, ILockException

def lock_control(command):
    import RPi.GPIO as GPIO

    GPIO.setmode(GPIO.BCM)

    relay1 = 18
    relay2 = 27
    relay3 = 22
    relay4 = 23
    all_relays = [relay1, relay2, relay3, relay4]

    motor_close_relay = relay3
    motor_open_relay = relay4
    open_clutch_relay = relay2
    close_clutch_relay = relay1

    step_sensor_pin = 24

    step_turn_timeout = 1
    open_steps = close_steps = 40

    def setup_pins():
        for relay in all_relays:
            GPIO.setup(relay, GPIO.OUT)
        GPIO.setup(step_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    def relay_on(relay):
        GPIO.output(relay, GPIO.LOW)

    def relay_off(relay):
        GPIO.output(relay, GPIO.HIGH)

    def all_relays_off():
        print("all relays off")
        for relay in all_relays:
            relay_off(relay)

    def step_status():
        return GPIO.input(step_sensor_pin)

    def wait_for_steps(count):
        last_status = step_status()
        last_status_change_time = time.time()

        while count > 0:
            print("steps remaining: " + str(count))
            status = step_status()
            now = time.time()
            if status != last_status:
                print("step")
                count = count - 1
                last_status = status
                last_status_change_time = now
            elif now - last_status_change_time >= step_turn_timeout:
                print("wait_for_steps timeout")
                return False

            time.sleep(0.1)

        print("all steps done")
        return True

    def open_lock():
        print("open lock")
        all_relays_off()
        relay_on(open_clutch_relay)
        relay_on(motor_open_relay)
        wait_for_steps(open_steps)
        all_relays_off()
        print("open lock done")
        print("")

    def close_lock():
        print("close lock")
        all_relays_off()
        relay_on(close_clutch_relay)
        relay_on(motor_close_relay)
        wait_for_steps(close_steps)
        all_relays_off()
        print("close lock done")
        print("")

    setup_pins()
    all_relays_off()

    try:
        if command == "open":
            open_lock()
        elif command == "close":
            close_lock()
        elif command == "loop":
            while True:
                open_lock()
                time.sleep(3)

                close_lock()
                time.sleep(3)
    except KeyboardInterrupt:
        pass

    all_relays_off()

    GPIO.cleanup()

command = sys.argv[1]

try:
    with ILock('lock_control', timeout=1):
        lock_control(command)

except ILockException:
    print("lock control is already running")
    sys.exit(2)
