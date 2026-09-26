# Study Mission Control — Database Architecture

## 1. Overview

Study Mission Control uses PostgreSQL through Supabase.

The database is designed around one principle:

> Raw user activity is the source of truth. Derived data such as analytics, streaks, trends, records, and summaries should be calculated from reliable stored data.

The database must support:

- user accounts
- profiles
- dynamic subjects
- study sessions
- timer events
- study tasks
- notes
- revision tracking
- daily summaries
- analytics
- future social features
- future groups and leaderboards
- future moderation and administration
- help and support

---

# 2. Database Technology

## Database

PostgreSQL

## Platform

Supabase

## Region

Mumbai / South Asia

Supabase region:

```text
ap-south-1