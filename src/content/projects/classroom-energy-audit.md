---
title: Classroom Energy Audit
tagline: A sensor kit that logs when a classroom's lights are left on with nobody inside, so the school can see how much energy it wastes.
academicYear: "2026-27"
stream: robotics
date: 2026-11-04
categories: [Sustainability, IoT]
status: building
featured: false
outcome: Logs when a classroom's lights are on with nobody inside, without touching the room's wiring. A two-person 9th grade team, first project.
size: wide
team: [Aania, Siddharth]
tech: [ESP32, BH1750 light sensor, HC-SR501 PIR motion sensor]
placeholder: true
---

> **To fill in:** photos, the final status after the BA Showcase, and any data collected. The details below come from the project's planning notes.

## The problem

Lights and fans are often left on in empty classrooms. Nobody knows how often it happens or what it costs.

## How it works

The kit watches one classroom without touching its wiring. Everything mounts with tape or velcro.

- A **BH1750 light sensor** is aimed at the light fixture (away from the windows) and reads brightness continuously.
- An **HC-SR501 PIR sensor** faces into the room and detects whether anyone is there.
- An **ESP32** reads both sensors every few seconds and logs a timestamp, whether the lights are on, and whether the room is occupied.

Using the light fixture's rated wattage, the log of "lights on, nobody here" time can be turned into wasted kWh, rupees and CO₂.

## Calibration

Daylight changes the light reading, so the team measures the room with the lights off and on at several times of day, then sets the on/off threshold halfway between the two ranges.

## Known limitations

- The light threshold can drift on unusually bright or dark days.
- The PIR sensor has a short reset delay, so a still room can briefly read as empty.
- Energy use is estimated from the fixture's rated wattage, not measured directly.
