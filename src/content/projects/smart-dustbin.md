---
title: Smart Dustbin
tagline: A touch-free bin that opens its lid when a hand comes near, so nobody has to touch a shared, dirty lid.
academicYear: "2026-27"
stream: robotics
date: 2026-11-04
categories: [Hardware, Automation]
status: building
featured: false
size: normal
team: [Adwitya, Ananya, Mihika]
tech: [ESP32, HC-SR04 ultrasonic sensor, MG995 servo, 4×AA battery pack, Voltage divider]
placeholder: true
---

> **To fill in:** photos, the final status after the BA Showcase, and what the team learned. The details below come from the project's planning notes.

## The problem

Shared bins in schools, canteens and clinics get touched by everyone, which spreads germs. A lid that opens on its own removes that touch point.

## How it works

An HC-SR04 ultrasonic sensor watches the space in front of the lid. The ESP32 averages a few readings to filter out noise, and when something comes within about 20 cm it drives an MG995 servo to open the lid. The lid stays open for about 3.5 seconds and then closes.

The design started from a common Arduino smart-dustbin build, with two changes: an ESP32 instead of an Arduino, and an MG995 servo instead of the usual SG90, which isn't strong enough to lift a real lid.

## Engineering details

- The HC-SR04's Echo pin outputs 5 V, but the ESP32 only accepts 3.3 V, so the signal goes through a 1 kΩ / 2 kΩ voltage divider.
- The servo draws too much current for the ESP32's 5 V pin, so it runs from its own 4×AA pack, sharing a common ground with the board.

## Possible extension

A second ultrasonic sensor inside the bin could detect when it's full.
