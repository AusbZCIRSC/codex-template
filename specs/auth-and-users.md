# Feature: Authentication and Users

## Status

Draft

## Problem

The test version of spark-tutor needs simple user authentication without public registration.

Each user must be mapped to exactly one training/class.

## Goals

- Support login.
- Support logout.
- Support password change.
- Prevent public sign-up.
- Persist user settings.
- Persist user-to-training/class mapping.
- Prepare for later SSO.

## Non-goals

- Public registration.
- Password reset flow in the first version.
- SSO in the first version.
- Multiple class memberships in the first version.

## User model

A user should have:

- ID
- Username or email
- Password hash
- Assigned training/class ID
- Role
- Created timestamp
- Updated timestamp
- Active/disabled flag

## Roles

Initial roles:

- `user`
- `admin`

Normal users may:

- Use chat
- Upload supported attachments
- Change password
- Change allowed user settings
- View their own chats

Admins may additionally:

- Manage test users
- Assign users to training/classes
- Ingest knowledge base content
- Access embedder/admin functionality

## Auth flows

### Login

1. User enters credentials.
2. Backend verifies credentials.
3. Backend creates session/token.
4. Frontend stores session according to chosen auth strategy.
5. User can access own chats.

### Logout

1. User triggers logout.
2. Session/token is invalidated or removed.
3. Frontend returns to login screen.

### Password change

1. User enters current password.
2. User enters new password.
3. Backend validates current password.
4. Backend validates new password policy.
5. Backend stores new password hash.
6. Existing sessions are handled according to security policy.

## Security rules

- Never store plaintext passwords.
- Never log passwords.
- Failed login responses should not reveal whether username or password was wrong.
- Disabled users cannot log in.
- Normal users cannot create accounts.
- Normal users cannot change their own training/class ID.
- Normal users cannot access another user’s chats.
- Normal users cannot access admin ingestion endpoints.

## Future SSO compatibility

The user model should allow adding:

- External identity provider
- External subject ID
- SSO-provided class/training mapping
- SSO-provided roles

## Tests

### Unit tests

- Password hashing works.
- Password verification works.
- Password policy rejects weak passwords.
- User settings validation works.

### Integration tests

- User can log in.
- User can log out.
- User can change password.
- Disabled user cannot log in.
- User cannot access another user’s chat.
- User cannot change own class assignment.

### Security tests

- Password is not stored as plaintext.
- Login failure message is generic.
- Admin-only endpoints reject normal users.