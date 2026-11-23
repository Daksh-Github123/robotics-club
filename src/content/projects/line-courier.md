---
title: Line-Following Courier
tagline: A little robot that delivers notes between classrooms by following tape lines on the floor.
academicYear: "2025-26"
date: 2026-04-10
categories: [Hardware, Software]
status: complete
featured: true
size: wide
team: [Student Name, Student Name]
tech: [Raspberry Pi Pico, IR line sensors, PID control, MicroPython]
placeholder: true
---

> **Placeholder project.** Replace this with a real one. See `HANDOFF.md` for how.

## The problem

Teachers kept sending students across the building just to hand over a piece of paper.

## How it works

Five infrared sensors read a tape line on the floor. A PID controller keeps the robot centered, and colored tape markers tell it where to stop.

## What we learned

Tuning PID by hand is an art. We built a little web dashboard to tweak the values live.
