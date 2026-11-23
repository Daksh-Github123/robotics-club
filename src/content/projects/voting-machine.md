---
title: Electronic Voting Machine
tagline: A button-per-candidate voting machine with an RFID lock that stops anyone voting twice, built to replace paper ballots at school.
academicYear: "2025-26"
date: 2026-03-01
categories: [Hardware, Software]
status: complete
featured: true
size: large
team: [Daksh Singh]
tech: [Arduino Uno R3, RC522 RFID reader, 74HC164 shift registers, 10 illuminated push buttons, 3D-printed case, Buzzer]
placeholder: true
---

> **To fill in:** photos and the exact date. The details below come from the project's build notes.

## The problem

The school runs elections on paper ballots. That wastes a lot of paper every year, and counting takes a long time. The work often falls to student council members, which leaves room for mistakes and unfair counting. The school needed a voting system it could trust.

## How it works

Each candidate has their own button, and the machine counts votes electronically. After every vote it locks itself. Only the person running the election (ideally a teacher) can unlock it for the next voter, by tapping an RFID card.

## Problems and solutions in Version 1

- **Voting twice:** an RFID lock that only the election manager's card can open.
- **Tampering or damage:** a hard 3D-printed case keeps the wiring and electronics out of reach.
- **Not enough pins:** an Arduino Uno doesn't have enough inputs for 10 buttons, so two 74HC164 shift registers read all the buttons and pass their states to the Arduino together.

## Version 3 (in progress)

V3 splits the machine across two ESP32 boards. The "vote brain" runs the 10 buttons, an LCD vote display, a buzzer and a teacher keypad, and stores the votes. The "auth module" handles only the RFID reader and signals the vote brain when a valid card is tapped. The buttons' LED rings run on their own separate battery circuit.

## Role in the club

This machine was the live demo at the club's first class. It showed members the path every project follows: a real problem, a working build, and design decisions driven by constraints.
