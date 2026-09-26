# Study Mission Control — Analytics

## 1. Purpose

Analytics shows the user's real study progress using verified data from `study_sessions`.

Core principle:

> Study sessions are the source of truth. Analytics is derived from them.

---

## 2. Main Metrics

Analytics should show:

- Total focused study time
- Daily average
- Weekly average
- Monthly average
- Yearly average
- Number of sessions
- Average session duration
- Longest session
- Current streak
- Longest streak
- Goal completion
- Most studied subject
- Study time by subject
- Most productive time of day

---

## 3. Time Ranges

Users should be able to view:

- Today
- Last 7 Days
- Last 30 Days
- 3 Months
- 1 Year
- Custom Range

---

## 4. Weekly Analytics

Show:

- Total weekly study time
- Daily breakdown
- Daily average
- Best study day
- Lowest study day
- Sessions
- Goal completion
- Subject breakdown

---

## 5. Monthly Analytics

Show:

- Monthly total
- Daily average
- Weekly average
- Sessions
- Goal completion
- Subject distribution
- Longest session
- Comparison with previous month

---

## 6. Yearly Analytics

Show:

- Total yearly study time
- Monthly breakdown
- Daily average
- Weekly average
- Sessions
- Goal completion
- Comparison with previous year

---

## 7. Subject Analytics

For each subject calculate:

- Total focused time
- Session count
- Average session duration
- Longest session
- Percentage of total study time

Subjects are dynamic and come from the user's `subjects` table.

---

## 8. Time-of-Day Analytics

Study sessions are grouped into:

```text
Morning:    5 AM – 12 PM
Afternoon: 12 PM – 5 PM
Evening:    5 PM – 9 PM
Night:      9 PM – 5 AM