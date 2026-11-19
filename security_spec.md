# MoLeCall Firestore Security Specification

## 1. Data Invariants
1. **PII Isolation**: User email addresses, inventory arrays, and private settings live strictly in `usersPrivate/{userId}`, readable and writable only by `request.auth.uid == userId`. `usersPublic/{userId}` contains no PII.
2. **Ownership Integrity**: Every write to `usersPublic/{userId}`, `usersPrivate/{userId}`, or `matches/{matchId}` requires `request.auth != null` and enforces that `uid` / `ownerUid` equals `request.auth.uid`.
3. **Immutable Identity**: `uid` and `playerId` on `usersPublic`, `uid` on `usersPrivate`, and `requesterUid`/`recipientUid` on `friendships` cannot be mutated after creation.
4. **Action-Based Updates & Terminal State Locking**: Friendships start as `pending` by `requesterUid`, can only transition to `accepted` by `recipientUid`, and once `accepted` cannot revert to `pending`. Match records are immutable once created (`allow update: if false`).
5. **Bounded Types & Sizes**: All document IDs match `^[a-zA-Z0-9_\-]+$` (<= 128 chars), all strings enforce explicit `.size()` bounds, and all arrays enforce bounded `.size()` checks.
6. **Note on Email/Password Signup**: Standard email/password registration creates an unverified Firebase Auth session initially; therefore user-owned document writes require `request.auth != null` and strict `isOwner()` checks rather than blocking freshly registered users.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `usersPrivate/uidA`.
2. Authenticated `uidB` reading `usersPrivate/uidA` (cross-user PII leak).
3. Authenticated `uidB` listing `usersPrivate` collection.
4. `usersPublic/uidA` create with shadow field `isAdmin: true`.
5. `usersPublic/uidA` create with oversized `username` (> 24 chars).
6. `usersPublic/uidA` update mutating `playerId` or `uid`.
7. `friendships/f1` create where `requesterUid != request.auth.uid` (spoofed sender).
8. `friendships/f1` create starting directly in `status: 'accepted'`.
9. `friendships/f1` update where `requesterUid` attempts to accept their own pending request.
10. `matches/m1` create where `ownerUid != request.auth.uid`.
11. `matches/m1` update attempting to rewrite `result` from `'defeat'` to `'victory'`.
12. `news/n1` client write attempt.
