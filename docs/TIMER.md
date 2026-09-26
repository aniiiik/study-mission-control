# Study Mission Control — Timer Architecture

## 1. Overview

The Study Mission Control timer is one of the core features of the application.

It supports two study modes:

- Stopwatch
- Pomodoro

The timer must accurately track focused study time while remaining reliable across:

- browser tab changes
- minimized browser windows
- page visibility changes
- refreshes
- temporary network issues
- browser crashes
- computer sleep
- multiple tabs
- multiple devices

The database remains the source of truth for persisted study-session information.

---

# 2. Timer Modes

## Stopwatch

Stopwatch mode allows the user to study continuously.

The user can:

```text
Start
Pause
Resume
Finish