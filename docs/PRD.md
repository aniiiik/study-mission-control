# Study Mission Control — Product Requirements Document

## 1. Product Overview

Study Mission Control is a personal study productivity and learning management web application.

It is designed for students, college learners, and competitive-exam aspirants such as UPSC, UPPSC, GATE, CDS, AFCAT, and similar exams.

The application acts as a personal command center for planning, studying, tracking progress, revising, taking notes, and understanding study habits.

The product is not limited to any particular exam, course, school, or subject.

---

## 2. Product Goals

The application should help users:

- Plan their study.
- Track focused study time.
- Maintain study consistency.
- Organize subjects.
- Create and manage notes.
- Track revision.
- Monitor study progress.
- Understand study patterns.
- Build long-term study habits.

The application should remain simple enough for everyday use while providing useful analytics as the user's study history grows.

---

## 3. Target Users

Primary users include:

- School students
- College students
- Competitive-exam aspirants
- Self-learners
- Developers and technical learners
- Anyone who wants to track structured learning

The system must not assume a fixed exam or educational path.

---

# 4. MVP Features

## 4.1 Authentication

Users can sign in using Google authentication.

Authentication will use:

- Supabase Auth
- Google OAuth

Each authenticated user receives a stable internal `user_id`.

One Google account corresponds to one application account.

---

## 4.2 User Profile

The profile will contain:

- user_id
- username
- display_name
- daily_goal_minutes
- timezone
- theme
- role
- account_status

Username requirements:

- Globally unique
- Case-insensitive
- Separate from the internal user ID
- Can be changed independently from the internal user ID

Education level, exam, class, or course information may be added later if it provides a clear product benefit.

---

# 5. Subjects

Subjects are user-created and dynamic.

There is no fixed global subject list.

The main study entry point should ask:

> What are you studying today?

Examples:

- Indian Polity
- React
- Thermodynamics
- Linux
- Java
- Mathematics

When a user enters a subject:

1. Normalize the subject name.
2. Search the user's existing subjects.
3. If a match exists, reuse it.
4. If no match exists, create a new subject.
5. Start or associate the study session with that subject.

Conceptually:

Typed subject
→ Normalize/search
→ Existing subject?
→ Reuse OR Create
→ Study Session

Subjects should contain:

- subject_id
- user_id
- name
- normalized_name
- is_archived

The same subject system is shared by:

- Timer
- Notes
- Planner
- Revision
- Analytics

Stable `subject_id` relationships must remain valid if a subject is renamed.

Archived subjects remain available for historical analytics.

---

# 6. Dashboard

The Dashboard is the user's main command center.

It should provide:

- Today's focused time
- Daily goal
- Goal progress
- Current streak
- Sessions today
- Today's mission
- Quick access to studying
- Relevant study insights

The dashboard should eventually include a project completion section/footer containing:

- Study Mission Control identity
- Project status
- Completion/version information
- Developer attribution
- Copyright notice

The completion section should only display the final completion status once version 1.0 is actually completed.

---

# 7. Study Timer

The timer supports:

- Stopwatch
- Pomodoro

## 7.1 Stopwatch

Users can:

- Select or create a subject
- Start studying
- Pause
- Resume
- Complete a session

Focused study time counts toward:

- Daily goal
- Streaks
- Analytics
- Records

## 7.2 Background Behavior

The timer should continue running when:

- Browser is minimized
- User switches tabs
- User uses another application

The browser must not automatically pause the timer simply because the page becomes hidden.

Timestamp-based elapsed-time calculation should be used rather than relying only on `setInterval`.

## 7.3 Pomodoro

Pomodoro consists of:

- Focus period
- Break
- Focus period
- Break

Focus time counts as study time.

Break time does not count as study time.

The break timer may continue while the application is in the background.

---

# 8. Timer Session Rules

The system should maintain one open study session per account.

If another tab or device attempts to start a new session while an existing session is active:

- The existing session must be paused/handled before another session starts.

Session states:

- ACTIVE
- PAUSED
- COMPLETED
- ORPHANED
- FINALIZED

Paused sessions have a maximum allowed pause duration of 24 hours.

After the maximum pause duration, the session is finalized and cannot be silently revived.

The application should support recovery after refresh or temporary connection problems.

Timer accuracy should be treated as approximate and supported by server timestamps/heartbeat/recovery logic when the backend implementation is introduced.

---

# 9. Study Session Data

Raw study sessions are the source of truth for study-time analytics.

A session should contain information such as:

- session_id
- user_id
- subject_id
- start time
- end time
- focused duration
- mode
- status
- timestamps required for recovery/auditing

The longest-session metric is based on actual focused/unpaused study duration rather than simple wall-clock session length.

---

# 10. Planner

The planner allows users to organize study tasks.

Users should be able to:

- Create tasks
- Assign subjects
- Set dates
- Track completion
- View planned work

Planner data should connect to the same user-specific subject system.

---

# 11. Notes

Users can create simple text notes.

Notes should:

- Belong to a user
- Be associated with subjects
- Be organized by subject/folders
- Be editable
- Be searchable later

Complex AI-generated notes are outside the MVP.

---

# 12. Revision

The revision system allows users to track topics/items that need revision.

Revision items should connect to the same subject system.

Automatic spaced repetition is outside the MVP.

---

# 13. Streaks

A streak is based on meeting the user's daily focused-study-time goal.

The day boundary follows the user's device/local timezone.

Daily goals are stored as date-specific snapshots for historical accuracy.

If the user changes their daily goal, the new goal applies from the next day.

---

# 14. Analytics

Study analytics should be based on raw study sessions and derived daily summaries.

Architecture:

Raw Study Sessions
→ Daily Summaries
→ Analytics

Analytics should provide:

## Today

- Total focused time
- Daily goal
- Goal progress
- Sessions
- Subjects studied
- Longest session
- Most studied subject

## Week

- Day-by-day focused hours
- Weekly total
- Daily average
- Best/lowest study day
- Goal completion
- Subject breakdown

## Last 30 Days

- Total focused hours
- Daily average
- Weekly average
- Best study day
- Average sessions/day
- Total sessions
- Goal completion
- Subject distribution
- Longest session
- Most productive day of week
- Study heatmap

## Yearly

- Monthly totals
- Daily averages
- Yearly total
- Average per day
- Average per week
- Monthly graph
- Previous-year comparison

## Time of Day

Study sessions should be analyzed according to when the user studies.

Buckets:

- Morning: 5 AM–12 PM
- Afternoon: 12 PM–5 PM
- Evening: 5 PM–9 PM
- Night: 9 PM–5 AM

## Consistency

Provide:

- Study days
- No-study days
- Average daily study time
- Goal completion
- Current streak
- Longest streak
- Sessions per day

## Goal vs Actual

Compare:

- Daily goal vs actual
- Weekly goal vs actual
- Monthly goal vs actual

## Subject Analytics

Subject analytics should support ranges:

- Today
- 7 Days
- 30 Days
- 3 Months
- 1 Year
- Custom

## Session History

Display:

- Date/time
- Subject
- Duration
- Mode

## Personal Records

Track:

- Longest session
- Highest study day
- Highest study week
- Highest study month
- Longest streak
- Most studied subject
- Most productive time period

## Weekly Report

Include:

- Weekly total
- Daily average
- Best day
- Most studied subject
- Goal achieved

## Trends

Provide comparisons such as:

- This week vs previous week
- This month vs previous month

Show numerical differences without ranking users.

## Calendar

Each date should display focused study duration.

Selecting a date should show its study sessions.

---

# 15. Data Architecture

Core database entities:

- profiles
- subjects
- study_sessions
- session_events
- study_tasks
- notes
- revision_items
- daily_summaries

Future social/moderation entities are intentionally outside the MVP.

---

# 16. Technology Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

Backend:

- Supabase

Database:

- PostgreSQL

Authentication:

- Supabase Auth
- Google OAuth

Hosting:

- Vercel

Version control:

- Git
- GitHub

Development:

- VS Code
- Cursor
- ChatGPT
- Claude
- Codex
- Gemini

---

# 17. Security

Security requirements include:

- Supabase Row Level Security
- Server-side ownership validation
- Users can access only their own study data
- Environment secrets must not be committed
- `.env.local` must remain ignored by Git
- Sensitive server-side keys must never be exposed to the frontend

---

# 18. MVP Exclusions

The following are outside the MVP:

- Leaderboards
- Friends/social system
- Performance sharing
- Payments/subscriptions
- Complex AI notes
- AI-generated MCQs
- Live classes
- Automatic spaced repetition
- Advanced analytics visualizations
- Real-time cross-device timer synchronization
- Full offline-first architecture
- Streak freeze

These can be considered for future versions.

---

# 19. Future Social Layer

Future versions may introduce:

- Unique public usernames
- Friends
- Performance sharing
- Leaderboards

A stable internal `user_id` must remain separate from the public username.

---

# 20. Future Moderation

Future versions may include:

- User reports
- Blocking
- Admin review
- Moderation actions
- Audit logs

These are not part of the MVP database.

---

# 21. Account Deletion

Users should be able to permanently delete their account after confirmation.

Associated user data should be permanently deleted according to the application's data-retention policy.

---

# 22. Ownership and Copyright

Study Mission Control is proprietary software unless explicitly stated otherwise.

Copyright notice:

> © 2026 Anik. All rights reserved.

The repository contains a proprietary LICENSE file describing permitted and prohibited uses.

Third-party dependencies remain subject to their respective licenses.

---

# 23. Product Completion

Version 1.0 will be considered complete when the agreed MVP features have been implemented, tested, secured, and deployed.

The final dashboard should contain a small project completion/signature section.

Example concept:

> Mission Complete  
> Study Mission Control v1.0  
> Built for focused learning.  
> Designed & Developed by Anik.  
> © 2026 Anik — All Rights Reserved.

The final completion date should be added only when the project actually reaches version 1.0.

---

# 24. Product Principle

Study Mission Control should remain:

- Simple
- Fast
- Reliable
- Mobile-friendly
- Desktop-friendly
- User-focused
- Privacy-conscious
- Extensible

The application should prioritize useful study workflows over unnecessary complexity.