# Study Mission Control — System Architecture

## 1. Architecture Overview

Study Mission Control is a responsive web-based study productivity platform.

The architecture is designed around four main principles:

- Reliable study-time tracking
- Secure user-owned data
- Reusable shared entities
- Future extensibility

High-level architecture:

User
  ↓
Browser
  ↓
React + TypeScript + Vite
  ↓
Supabase
  ├── Authentication
  ├── Backend services
  └── PostgreSQL
        ↓
      User Data
        ↓
   Derived Analytics

The initial product is a website.

Future native Android/iOS applications may use the same backend.

---

# 2. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- React Router

## Backend

- Supabase

## Database

- PostgreSQL

## Authentication

- Supabase Auth
- Google OAuth

## Hosting

- Vercel

## Version Control

- Git
- GitHub

## Development Tools

- VS Code
- Cursor
- Codex
- Claude
- Gemini
- ChatGPT

---

# 3. High-Level System

```text
                    USER
                      |
                      v
             Responsive Browser
                      |
                      v
            React + TypeScript
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
      Auth        Study System    Analytics
        |             |             |
        +-------------+-------------+
                      |
                      v
                   Supabase
              /       |       \
             /        |        \
            v         v         v
         Auth      Backend   PostgreSQL
                               |
                               v
                         User-owned data