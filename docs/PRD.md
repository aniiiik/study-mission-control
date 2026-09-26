# Study Mission Control — Product Requirements Document

## 1. Product Overview

### Product Name

Study Mission Control

### Product Type

Web-based study productivity and learning management platform.

### Product Vision

Study Mission Control is a personal command center for students and competitive-exam aspirants.

It helps users:

- Plan what they need to study
- Start focused study sessions
- Track study time
- Organize subjects
- Manage study tasks
- Create notes
- Track revision
- Understand study habits
- Monitor consistency and streaks
- Review long-term study progress

The product should work for different types of learners rather than being limited to a particular examination.

Examples:

- UPSC
- UPPSC
- GATE
- CDS
- AFCAT
- SSC
- School students
- College students
- University students
- Programming learners
- Skill learners
- Self-learners

---

# 2. Product Goals

The primary goals are:

1. Make starting a study session extremely simple.
2. Keep study tracking accurate and reliable.
3. Give users a clear view of their daily mission.
4. Help users organize subjects, notes, tasks and revision.
5. Provide meaningful study analytics.
6. Encourage consistency through streaks and progress tracking.
7. Provide a distraction-free Focus Mode.
8. Work equally well on desktop and mobile.
9. Keep user data private and secure.
10. Build the architecture so future social, group and community features can be added without redesigning the core system.

---

# 3. Target Users

## Primary Users

Students and learners who want to track and improve their study habits.

## Example Users

- Competitive exam aspirants
- School students
- College students
- University students
- Programming learners
- Data analytics learners
- Cybersecurity learners
- Web-development learners
- Self-directed learners

The application should not assume that every user is preparing for an examination.

---

# 4. Core Product Principles

The product should follow these principles:

### Simple

Starting a study session should require minimal interaction.

### Accurate

Study time should be calculated from reliable timestamps rather than only browser-side counters.

### Private

A user's study information belongs to that user unless they explicitly choose to share it.

### Flexible

Users can create their own subjects rather than selecting from a fixed global subject list.

### Consistent

Timer, notes, planner and revision should use the same subject system.

### Responsive

The website must work properly on desktop and mobile.

### Extensible

The architecture should allow future social, group, moderation and mobile-app functionality.

---

# 5. Authentication

## Google Login

Users will authenticate using Google OAuth through Supabase Auth.

Authentication flow:

Google OAuth
→ Supabase Auth
→ Supabase user ID
→ Profile
→ Dashboard

## Account Identity

Each Google account corresponds to one application account.

The Supabase `user.id` is the permanent internal identity.

The public username is separate from the internal user ID.

## Username

Users may have a unique public username.

Requirements:

- Globally unique
- Case-insensitive uniqueness
- User-selectable
- Separate from the internal user ID
- Can potentially be changed later according to username policy

---

# 6. User Profile

Each user will have a profile.

Possible profile information:

- Avatar
- Username
- Display name
- Daily study goal
- Timezone
- Theme
- Current streak
- Total focused study time
- Study days
- Subjects
- Recent activity
- Personal records

Future profile information may include:

- Education level
- Exam
- Class
- Course

These fields should only be added if they provide meaningful functionality.

---

# 7. Dynamic Subjects

Subjects must NOT be a fixed global list.

The user should be able to enter any subject or topic.

Example:

> What are you studying today?

The user may enter:

- Indian Polity
- History
- React
- Java
- Thermodynamics
- Operating Systems
- Cybersecurity
- Economics

If the subject already exists for that user, the existing subject should be reused.

If it does not exist, a new subject should be created.

Conceptual flow:

Typed Subject
→ Normalize/search user's subjects
→ Existing match?

YES
→ Reuse subject

NO
→ Create subject

Both paths
→ Create Study Session

Each subject should conceptually contain:

- `id`
- `user_id`
- `name`
- `normalized_name`
- `is_archived`
- timestamps

The same subject system should be shared by:

- Timer
- Notes
- Planner
- Revision
- Analytics

A stable subject ID ensures that renaming a subject does not break existing relationships.

Archived subjects should remain available for historical analytics.

---

# 8. Dashboard

The Dashboard is the user's main command center.

## Dashboard Sections

Possible dashboard information:

### Today's Goal

Display:

- Daily goal
- Focused time
- Progress
- Remaining time

### Today's Mission

Provide a clear action to start studying.

### Current Streak

Show:

- Current streak
- Longest streak

### Sessions Today

Show:

- Number of sessions
- Total focused time

### Recent Activity

Display recent study sessions.

### Quick Actions

Possible actions:

- Start Studying
- Continue Session
- Open Planner
- Create Note
- Start Revision
- View Analytics

### Future Completion Section

After the application is actually completed and released as version 1.0, the dashboard may contain a completion section such as:

> Mission Complete

> Study Mission Control v1.0

> Built for focused learning.

> Designed & Developed by Anik.

> © 2026 Anik — All Rights Reserved.

Technology information may also be displayed:

> Built with React • TypeScript • Tailwind • Supabase • PostgreSQL

This completion section should not claim that the product is complete before the actual v1.0 implementation is finished.

---

# 9. Study Timer

The timer is one of the core features of the application.

The timer must support:

- Stopwatch
- Pomodoro
- Subject selection
- Start
- Pause
- Resume
- Finish
- Session history
- Background operation
- Focus Mode
- Calculator access

---

# 10. Subject Selection for Timer

Before starting a study session, the user should select or enter a subject.

Example:

> What are you studying today?

The user enters:

> Indian Polity

The system searches the user's subjects.

If found:

> Reuse existing subject.

If not found:

> Create subject.

Then the study session begins.

---

# 11. Timer Background Behaviour

The timer should continue running when:

- Browser is minimized
- Browser is in the background
- User switches to another browser tab
- User switches to another application

The timer should NOT automatically pause simply because the browser is hidden.

The timer should continue based on the underlying session timestamps.

The browser UI may stop updating while inactive, but when the user returns it should calculate the current elapsed active time correctly.

---

# 12. Maximum Continuous Study Run

A single continuous active study run has a maximum duration of:

**4 hours**

This is NOT a daily study limit.

Example:

User studies:

- 4 hours
- pauses automatically
- resumes
- studies another 2 hours

Total focused time:

6 hours

This is allowed because the 4-hour limit applies only to one continuous active run.

When 4 hours of continuous active study time is reached:

1. The timer automatically pauses.
2. The current study time is preserved.
3. The user sees a clear message.
4. The user must press Resume/Play to continue.

When starting a session, the application should display a polished message such as:

> **Study session started. You can study for up to 4 hours continuously. The timer will pause automatically after 4 hours. You can resume whenever you're ready.**

---

# 13. Timer Display

The timer display must update smoothly.

Expected sequence:

```text
00:01
00:02
00:03
00:04
00:05


---

# 14. Timer State Machine

The study session should support these states:

START
  ↓
ACTIVE
  ↓
PAUSED
  ↓
ACTIVE
  ↓
COMPLETED

Additional reliability states:

ACTIVE
  ↓
ORPHANED

PAUSED
  ↓
FINALIZED

States:

- `active`
- `paused`
- `completed`
- `orphaned`
- `finalized`

---

# 15. Timer Session Rules

## One Open Session Per User

A user may have only one open study session at a time.

Open session means:

- Active
- Paused

If the user tries to start another session while one exists, the application should require the existing session to be handled first.

This should be enforced at the database level.

## Multiple Tabs

If the same account is opened in multiple browser tabs, they must not create independent active sessions.

The backend/database remains the authority.

## Refresh

Refreshing the page must not create a duplicate session.

An existing session should be recovered from the server.

## Browser Crash

The system should use timestamps and heartbeat information to recover as much valid study time as possible.

Unknown time should not automatically be counted as focused study time.

---

# 16. Heartbeat

The client should periodically communicate with the backend while an active session exists.

Expected heartbeat interval:

Approximately 15–30 seconds.

Heartbeat information may include:

- Session ID
- Timestamp
- Session state
- Active timestamp information

The exact implementation may change as the timer system is developed.

---

# 17. Server-Authoritative Timer

The server/database should remain the source of truth for study sessions.

The browser should not be trusted as the only source of study duration.

Conceptually:

Browser Timer UI
      ↓
Server Session
      ↓
Database Timestamps
      ↓
Calculated Focused Duration

The frontend may use the browser clock for smooth visual updates.

---

# 18. Paused Session Expiration

A paused session should not remain recoverable forever.

Maximum paused duration:

**24 hours**

After 24 hours:

- The session becomes finalized.
- It cannot silently resume.
- The user must start a new session.

---

# 19. Midnight Crossing

If a study session crosses midnight, focused duration should be split proportionally between the applicable local calendar days.

Example:

23:50 → 00:20

The appropriate focused time should be attributed to:

- Previous day
- New day

based on the user's local timezone.

---

# 20. Streaks

Streaks are based on meeting the user's daily focused-study goal.

The streak day boundary follows the user's device/local timezone.

A day counts toward the streak when the user reaches the applicable daily goal.

The application should track:

- Current streak
- Longest streak
- Study days
- No-study days

Daily goal changes apply from the next day.

Historical days should not be retroactively recalculated using a newly changed goal.

The goal used for a particular date should be preserved as a snapshot/derived historical value where necessary.

---

# 21. Study Time Accuracy

The system should prioritize reliable timestamps over visual timer counters.

Study duration should be calculated from active intervals.

For example:

Start
→ Active
→ Pause
→ Resume
→ Active
→ Finish

Only active periods count toward focused time.

Paused periods do not count.

Pomodoro break periods do not count.

---

# 22. Longest Session

The longest study session should be based on focused active duration.

Paused time should not artificially increase the longest focused session.

---

# 23. Time-of-Day Analytics

Study sessions should be analyzed by the time they occurred.

Buckets:

- Morning: 5:00 AM – 12:00 PM
- Afternoon: 12:00 PM – 5:00 PM
- Evening: 5:00 PM – 9:00 PM
- Night: 9:00 PM – 5:00 AM

The exact timestamp of sessions remains available for more detailed analytics.

---

# 24. Session History

Users should be able to view their study history.

Each completed session may show:

- Date
- Start time
- End time
- Subject
- Duration
- Mode
- Session status

Possible future filters:

- Today
- Yesterday
- This week
- This month
- Subject
- Timer mode

---

# 25. Calculator

The Timer page should provide a reusable Calculator component.

Calculator modes:

- Normal
- Scientific
- GATE

The calculator should support appropriate mathematical functions for each mode.

Calculator history should be stored locally for the user's convenience.

The calculator should not affect study-session calculations.

---

# 26. Planner

The Planner helps users organize study tasks.

A task may contain:

- Title
- Description
- Subject
- Due date
- Priority
- Status
- Created timestamp
- Completion timestamp

Priority levels:

- Low
- Medium
- High

Task statuses:

- Pending
- Completed
- Cancelled

---

# 27. Notes

Users should be able to create and organize notes.

A note may contain:

- Title
- Content
- Subject
- Created timestamp
- Updated timestamp

Notes should be associated with the same subject system used by the Timer.

---

# 28. Revision

The Revision system will help users track topics that need review.

Revision functionality may include:

- Revision items
- Subject association
- Topic
- Revision status
- Revision dates
- Completion tracking

Automatic spaced repetition is excluded from the initial MVP.

---

# 29. Analytics

Analytics should help users understand their study habits.

Analytics should not simply show a single total.

The system should provide useful breakdowns.

---

# 30. Today Analytics

Today should show:

- Total focused time
- Daily goal
- Goal progress
- Number of sessions
- Subjects studied
- Longest session
- Most studied subject

---

# 31. Weekly Analytics

Weekly analytics should include:

- Day-by-day focused time
- Weekly total
- Daily average
- Best study day
- Lowest study day
- Goal completion
- Subject breakdown

---

# 32. Last 30 Days Analytics

Possible information:

- Total focused hours
- Daily average
- Weekly average
- Best day
- Average sessions per day
- Total sessions
- Goal completion
- Subject distribution
- Longest session
- Most productive day of week
- 30-day activity heatmap

---

# 33. Yearly Analytics

Yearly analytics should include:

- Monthly totals
- Monthly averages
- Yearly total
- Average per day
- Average per week
- Monthly graph
- Previous-year comparison

The previous-year comparison should present factual numerical differences.

---

# 34. Subject Analytics

Subject analytics should allow users to understand where their study time is going.

Possible ranges:

- Today
- 7 Days
- 30 Days
- 3 Months
- 1 Year
- Custom

Possible information:

- Time per subject
- Sessions per subject
- Percentage of focused time
- Recent subjects

---

# 35. Goal vs Actual

The application should compare:

- Goal vs actual daily time
- Goal vs actual weekly time
- Goal vs actual monthly time

The purpose is to help users understand their own consistency.

---

# 36. Personal Records

Possible personal records:

- Longest focused session
- Highest study day
- Highest study week
- Highest study month
- Longest streak
- Most studied subject
- Most productive time period

These are personal records, not rankings against other users.

---

# 37. Calendar Analytics

The analytics area may include a calendar.

Each date can display focused study duration.

Selecting a date can show:

- Total focused time
- Sessions
- Subjects
- Session details

---

# 38. Weekly Report

A weekly report may include:

- Weekly total
- Daily average
- Best study day
- Most studied subject
- Goal achievement
- Session count
- Subject distribution

---

# 39. Trends

The application may compare:

- This week vs previous week
- This month vs previous month
- This year vs previous year

Comparisons should display factual numerical differences.

---

# 40. Analytics Architecture

Raw study sessions are the source of truth.

Conceptually:

Raw Study Sessions
        ↓
Daily Summaries
        ↓
Analytics

Daily summaries may be used as a performance/aggregation layer.

Longer-range analytics can use daily rollups where appropriate.

---

# 41. Data Export

A future version may allow users to export their study information.

Possible formats:

- CSV
- JSON

Export may include:

- Study sessions
- Study duration
- Subjects
- Tasks
- Notes
- Analytics summaries

Export scope and privacy rules should be finalized before implementation.

---

# 42. Theme

The application should support:

- Dark theme
- Light theme

Theme preference should belong to the user's profile.

The interface should remain readable and accessible in both themes.

---

# 43. Responsive Design

The website should support:

- Desktop
- Laptop
- Tablet
- Mobile

Desktop and mobile should be treated as equally important.

The core features should remain usable on small screens.

---

# 44. Social, Groups, Privacy & Community Features

These features are planned for a future version and are not part of the initial MVP.

## User Profiles

Users will have a shareable profile containing selected study information such as:

- Avatar
- Username
- Display name
- Current streak
- Total focused study time
- Study days
- Daily study goal
- Subjects studied
- Recent activity
- Study activity heatmap
- Weekly/monthly activity
- Time-of-day study patterns
- Personal records

Users control which information is visible.

## Privacy Controls

Users will be able to configure:

- Profile visibility: Private / Friends / Public
- Whether study statistics can be shared
- Whether subjects can be displayed
- Whether activity information can be displayed

Private information must never become publicly visible by default.

## Friends

Future versions may support:

- Sending friend requests
- Accepting friend requests
- Rejecting friend requests
- Removing friends
- Viewing friends' permitted profile information
- Sharing study progress with friends

## Groups

Users will be able to create and join study groups.

A group may contain:

- Group name
- Group description
- Group owner
- Group members
- Group settings
- Group leaderboard

Group owners will have appropriate management permissions.

## Group Leaderboards

Group leaderboards will be calculated from actual study-session data.

Leaderboard data must not be manually entered or stored as arbitrary scores.

Possible metrics include:

- Focused study time
- Study days
- Weekly study time
- Monthly study time

Leaderboard visibility will respect user privacy settings and group membership.

---

# 45. Admin / Owner Control Center

The project owner will have a separate server-authorized Admin/Control Center.

Admin capabilities may include:

- View registered users
- View permitted user/profile information
- Edit permitted profile/account information
- Suspend accounts
- Restore suspended accounts
- Permanently delete accounts after confirmation
- Manage groups
- Review reported accounts
- Review support requests
- Review moderation history
- View audit history
- View platform-level usage statistics

Possible admin dashboard metrics:

- Total registered users
- Active users
- New users today
- New users this week
- Total focused study hours
- Sessions today
- Feature usage
- Reported accounts
- Suspended accounts
- Open support requests

## Admin Security

Admin privileges must be enforced server-side.

The frontend must never be trusted to determine whether a user is an administrator.

Normal users must not be able to:

- Change their own role to admin
- Access admin-only data
- Access another user's private information
- Perform administrative actions through manipulated client requests

Admin actions should eventually be recorded in an audit log.

---

# 46. Help & Support

The application will provide a Help & Support section.

Users can submit support requests using categories such as:

- Timer not working
- Login / Google account problem
- Notes problem
- Planner / tasks problem
- Study time or analytics looks incorrect
- Account problem
- Report a bug
- Suggest a feature
- Something else

Each request may contain:

- Support request ID
- Category
- User account reference
- Description
- Created timestamp
- Status
- Admin response
- Resolution timestamp

Users will be able to enter a free-form description explaining their problem.

## Support Email Privacy

The owner's private email address must never be exposed in the frontend application.

Support requests should follow a secure server-side flow:

User
  ↓
Help & Support Form
  ↓
Supabase / Secure Backend
  ↓
Secure Email Service
  ↓
Owner's Private Support Inbox

The destination email address must remain server-side.

The frontend must not contain:

- Owner's Gmail address
- Email credentials
- SMTP passwords
- Private API keys
- Other sensitive support configuration

---

# 47. Moderation & Reports

Future versions may allow users to report accounts or inappropriate activity.

Possible report flow:

User
  ↓
Report
  ↓
Moderation Queue
  ↓
Admin Review
  ↓
Administrative Action
  ↓
Audit Record

Possible administrative actions:

- Dismiss report
- Warn user
- Suspend account
- Restore account
- Permanently delete account where appropriate

Moderation actions should be auditable.

---

# 48. Account Management

Users may permanently delete their account after explicit confirmation.

Account deletion should remove or anonymize associated data according to the application's documented data-retention policy.

Administrative deletion must also require explicit confirmation.

Suspension and deletion are separate concepts:

### Suspended

The account remains in the system but cannot use the application.

### Deleted

The account is permanently removed according to the documented deletion policy.

---

# 49. Security

Security is a core product requirement.

The application should use:

- Supabase Authentication
- PostgreSQL Row Level Security
- Server-side ownership validation
- Secure environment variables
- Protected API/server operations
- Role-based authorization
- Admin authorization
- Input validation
- Database constraints

Users should only be able to access their own private data unless explicit sharing permissions allow otherwise.

---

# 50. Row Level Security

Database tables containing user data should use PostgreSQL Row Level Security.

Ownership should generally be enforced using:

user_id = authenticated user ID

Administrative access should use server-authorized mechanisms.

Frontend UI visibility must never be considered sufficient security.

---

# 51. Environment Variables

Sensitive configuration must not be hardcoded into source files.

Local development should use:

.env.local

Production environment variables should be configured through the deployment platform.

Private secrets must never be committed to GitHub.

---

# 52. Technology Stack

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

## Development

Primary editor:

- VS Code

Additional AI development tools may include:

- Cursor
- Codex
- Claude
- Gemini
- ChatGPT

---

# 53. Database Core

The core database will contain entities such as:

profiles
subjects
study_sessions
session_events
study_tasks
notes
revision_items
daily_summaries

Future social/community entities may include:

friendships
friend_requests
groups
group_members
group_settings
reports
support_requests
admin_audit_logs

The exact schema for future entities will be finalized before implementation.

---

# 54. Core Data Relationships

Conceptually:

User
 │
 ├── Profile
 │
 ├── Subjects
 │      │
 │      ├── Study Sessions
 │      ├── Notes
 │      ├── Tasks
 │      └── Revision Items
 │
 ├── Session Events
 │
 └── Daily Summaries

Future:

User
 │
 ├── Friends
 │
 ├── Groups
 │      └── Group Members
 │
 ├── Reports
 │
 └── Support Requests

---

# 55. Account Deletion

Account deletion requires explicit confirmation.

The deletion process should handle associated data according to documented retention rules.

The application should prevent orphaned personal data where possible.

The deletion process must be implemented securely on the backend.

---

# 56. MVP Scope

The initial MVP should focus on:

- Google authentication
- User profile
- Dashboard
- Dynamic subjects
- Stopwatch timer
- Pomodoro timer
- 4-hour continuous active-run limit
- Background timer operation
- Timer session history
- Focus Mode
- Calculator
- Planner
- Notes
- Revision
- Basic streaks
- Study analytics
- Light/dark theme
- Responsive desktop/mobile UI
- PostgreSQL database
- Supabase RLS
- Basic account management

---

# 57. Features Excluded From Initial MVP

The following are intentionally excluded from the initial MVP:

- Social feed
- Friends
- Friend requests
- Public profiles
- Groups
- Group leaderboards
- Payments
- Subscriptions
- Live classes
- Advanced AI notes
- Automatic AI-generated MCQs
- Automatic spaced repetition
- Advanced gamification
- Real-time cross-device timer synchronization
- Full offline-first architecture
- Streak freeze
- Complex moderation system
- Advanced support ticketing
- Native Android application
- Native iOS application

These may be added after the core product is stable.

---

# 58. Future Mobile Applications

The first product will be a responsive website.

Native Android/iOS applications may be developed later if the product gains sufficient adoption.

The backend architecture should therefore avoid unnecessary frontend-specific assumptions.

Future mobile applications should be able to use the same:

- Authentication
- Database
- Study sessions
- Subjects
- Analytics
- User accounts

---

# 59. Deployment Architecture

Development:

VS Code / Cursor
      ↓
Git
      ↓
GitHub

Production:

GitHub
   ↓
Vercel
   ↓
React Website
   ↓
Supabase
   ├── Authentication
   ├── Backend
   └── PostgreSQL

---

# 60. Project Structure

Recommended structure:

study-mission-control/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── shared/
│   │   └── calculator/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── timer/
│   │   ├── subjects/
│   │   ├── planner/
│   │   ├── notes/
│   │   ├── revision/
│   │   └── analytics/
│   │
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── TIMER.md
│   ├── ANALYTICS.md
│   └── SECURITY.md
│
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

Folders and files should be created as features are implemented rather than creating the entire structure unnecessarily at the beginning.

---

# 61. Documentation

The project should maintain separate technical documentation for:

docs/
├── PRD.md
├── ARCHITECTURE.md
├── DATABASE.md
├── TIMER.md
├── ANALYTICS.md
└── SECURITY.md

The documentation should be updated as implementation decisions become finalized.

---

# 62. Copyright & Ownership

Study Mission Control is proprietary software.

Copyright notice:

Copyright (c) 2026 Anik

All rights reserved.

Study Mission Control is proprietary software.

The source code, design, documentation, visual assets, and other original
materials contained in this repository are the intellectual property of
Anik, unless otherwise stated.

No permission is granted to copy, reproduce, redistribute, modify, publish,
relicense, sublicense, sell, or commercially exploit this project or any
substantial portion of it without prior written permission from the
copyright owner.

Viewing the source code for personal evaluation or learning purposes does
not grant permission to reuse, redistribute, or publish the code.

Third-party libraries and dependencies remain subject to their respective
licenses.

---

# 63. Product Completion

The project should only be considered version 1.0 complete after:

- Core authentication works
- User profiles work
- Dynamic subjects work
- Timer works reliably
- 4-hour continuous-run limit works
- Stopwatch works
- Pomodoro works
- Background timer behaviour works
- Focus Mode works
- Timer history works
- Calculator works
- Planner works
- Notes work
- Revision works
- Streaks work
- Analytics work
- Database security is implemented
- RLS policies are tested
- Responsive design is tested
- Error handling is implemented
- Production deployment is tested
- Account deletion works
- Documentation is updated
- Copyright/ownership information is included
- Final QA is completed

Only after these requirements are satisfied should the application be presented as:

Study Mission Control v1.0

---

# 64. Product Success Criteria

The MVP should allow a new user to:

Sign in
  ↓
Create/choose a subject
  ↓
Start studying
  ↓
Pause/resume or finish
  ↓
See their focused time
  ↓
Track their progress
  ↓
Plan future study
  ↓
Create notes
  ↓
Track revision
  ↓
Understand their study habits

The core experience should remain simple enough that a user can start studying without learning how the application works.

---

# 65. Development Strategy

Development should proceed in phases.

## Phase 1 — Foundation

- React + TypeScript + Vite
- Tailwind
- Routing
- Layout
- Supabase
- Authentication
- Database foundation

## Phase 2 — Core Study System

- Profiles
- Subjects
- Timer
- Stopwatch
- Pomodoro
- Session history
- Focus Mode

## Phase 3 — Productivity

- Planner
- Notes
- Revision

## Phase 4 — Analytics

- Daily analytics
- Weekly analytics
- Monthly analytics
- Yearly analytics
- Subject analytics
- Streaks
- Personal records

## Phase 5 — Security & Reliability

- RLS verification
- Timer reliability
- Error handling
- Account management
- Data validation
- Production security

## Phase 6 — Production

- Responsive QA
- Deployment
- Documentation
- Final testing
- v1.0 completion

## Phase 7 — Future Community Features

After the MVP is stable:

- Friends
- Friend requests
- Profile sharing
- Groups
- Group leaderboards
- Reports
- Moderation
- Admin Control Center
- Help & Support
- Secure support email
- Additional community features

---

# 66. Product Architecture Philosophy

The application should keep the core study system independent from future social functionality.

Core study functionality:

User
↓
Subjects
↓
Study Sessions
↓
Analytics

Future community functionality:

User
↓
Friends
↓
Groups
↓
Group Members
↓
Group Statistics

Future administration:

User
↓
Reports / Support
↓
Admin Review
↓
Moderation / Support Action
↓
Audit Log

This separation should make it possible to introduce social and administrative features without compromising the reliability of the core study-tracking system.

---

# 67. Product Scalability

The architecture should allow the application to grow from a personal study tracker into a larger learning platform.

The system should therefore:

- Use stable internal user IDs
- Keep subjects user-specific
- Keep raw study sessions as the source of truth
- Use derived analytics rather than manually stored statistics
- Enforce ownership at the database level
- Keep administrative permissions server-side
- Keep private support configuration server-side
- Separate future social features from core study functionality
- Avoid hardcoding a fixed subject list
- Avoid assuming a single exam or learner type

---

# 68. Final Product Principle

Study Mission Control should ultimately become a personal learning command center.

The core philosophy is:

Plan
  ↓
Study
  ↓
Track
  ↓
Analyze
  ↓
Improve
  ↓
Repeat

The product should help users spend less time managing their study system and more time actually studying.



