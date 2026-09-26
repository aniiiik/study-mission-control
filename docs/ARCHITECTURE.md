# Study Mission Control — Architecture

## 1. High-Level Architecture

```text
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
        ├── Profiles
        ├── Subjects
        ├── Study Sessions
        ├── Session Events
        ├── Tasks
        ├── Notes
        ├── Revision Items
        └── Daily Summaries