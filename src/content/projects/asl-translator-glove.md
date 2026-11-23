---
title: ASL Translator Glove
tagline: A glove with a flex sensor on each finger that reads American Sign Language letters and shows them on a phone.
academicYear: "2026-27"
date: 2026-11-04
categories: [Hardware, Assistive Tech]
status: building
featured: true
outcome: Built solo by a 9th grader as their first electronics project. It reads hand signs and shows the letter on a phone.
size: tall
team: [Sohna]
tech: [Arduino Nano, 5× flex sensors, HC-05 Bluetooth module, MIT App Inventor]
placeholder: true
---

> **To fill in:** photos, the final status after the BA Showcase, and which letters it can read reliably. The details below come from the project's planning notes.

## The problem

Deaf and hard-of-hearing people often have no interpreter available when they need one. A wearable that turns signs into text could help in everyday conversations.

## How it works

A flex sensor runs along the top of each finger and measures how bent it is. Each sensor forms a voltage divider with a 10 kΩ resistor, read by an analog pin on an Arduino Nano.

When it starts, the glove runs a calibration routine: the wearer holds each target sign for a few seconds while the code records each finger's range. After that it compares live readings to those ranges, picks the matching letter, and sends it over Bluetooth (HC-05) to a phone app built in MIT App Inventor.

The plan starts with very distinct letters such as A, B, C, L and Y before adding more.

## Known limitations

- Flex sensors only measure finger curl. They can't see palm orientation or wrist angle, so letters that differ only in hand rotation can't be told apart. The full alphabet isn't possible with flex sensors alone.
- Readings drift with temperature, use and how tight the glove is.
- Calibration only works for the person who did it.
- The glove uses ASL handshapes. Using it in India would mean re-mapping it to Indian Sign Language.
