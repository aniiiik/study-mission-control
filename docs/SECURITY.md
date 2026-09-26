# Study Mission Control — Security

## 1. Purpose

Security is a core requirement of Study Mission Control.

The application must protect:
- User accounts
- Study data
- Personal profile information
- Authentication credentials
- Administrative functions

---

## 2. Authentication

Authentication will use Supabase Auth with Google OAuth.

Rules:
- One Google account maps to one internal `user_id`.
- Authentication is handled by Supabase.
- Passwords are not stored by the application.
- Sessions must be validated server-side.
- Logged-out users cannot access protected application data.

---

## 3. Authorization

Authentication proves who the user is.

Authorization determines what the user can access.

Every protected operation must verify:
- Authenticated user
- Correct `user_id`
- Required permissions
- Account status

Users must only access their own private data.

---

## 4. Row Level Security

PostgreSQL Row Level Security (RLS) is required for user-owned tables.

Core tables use ownership checks based on `user_id`.

RLS must prevent users from:
- Reading another user's data
- Updating another user's data
- Deleting another user's data
- Creating records for another user

Frontend checks are not considered sufficient security.

---

## 5. Admin Security

Admin permissions must be enforced server-side.

The frontend must never be trusted to determine whether a user is an admin.

Admin actions include:
- User management
- Account suspension/restoration
- Support management
- Report management
- Moderation
- Platform administration

Administrative actions should be recorded in future `admin_audit_logs`.

---

## 6. Environment Variables

Sensitive configuration must never be committed to Git.

Use:

```text
.env.local