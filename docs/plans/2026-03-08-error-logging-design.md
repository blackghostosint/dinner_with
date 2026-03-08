# Error Logging — Design

**Date:** 2026-03-08
**Status:** Approved

## Goal

Capture all unhandled errors in the app and store them in Supabase so they can be inspected in the dashboard for debugging.

## Scope

- React render errors (Error Boundary)
- Unhandled JS exceptions (`window.onerror`)
- Unhandled promise rejections (`window.onunhandledrejection`)
- Manual calls via `logError()` from anywhere in the app

Logs are anonymous (no user ID stored).

## Supabase Table — `error_logs`

| column       | type        | notes                                              |
|--------------|-------------|----------------------------------------------------|
| `id`         | `uuid`      | primary key, default `gen_random_uuid()`           |
| `created_at` | `timestamptz` | default `now()`                                  |
| `message`    | `text`      | `error.message`                                    |
| `stack`      | `text`      | `error.stack`, nullable                            |
| `source`     | `text`      | `'boundary'`, `'global'`, `'promise'`, `'manual'` |
| `url`        | `text`      | `window.location.href` at time of error            |
| `metadata`   | `jsonb`     | optional extra context from manual calls           |

**RLS policy:** insert-only from anon role. No select, update, or delete from the client.

## Components

### `src/lib/errorLogger.js`

- Exports `logError(error, source, metadata?)`
- Inserts one row to `error_logs`
- Never throws — wraps the Supabase call in try/catch and silently swallows failures so logging never breaks the app
- Normalises input: accepts `Error` objects or plain strings

### `src/components/ErrorBoundary.jsx`

- Class component (required by React for error boundaries)
- `componentDidCatch(error, info)` calls `logError(error, 'boundary', { componentStack: info.componentStack })`
- Renders a minimal fallback UI (plain message, reload button) — no spinner, no nav
- Wraps the entire app in `main.jsx`

### `src/main.jsx` changes

Two global handlers registered once at module load:

```js
window.onerror = (message, source, lineno, colno, error) => {
  logError(error ?? new Error(message), 'global', { source, lineno, colno });
};

window.onunhandledrejection = (event) => {
  logError(event.reason ?? new Error('Unhandled rejection'), 'promise');
};
```

## Error Handling

`logError` itself must never throw. If Supabase is unavailable or misconfigured, the error is silently dropped. This is intentional — logging failures must not affect the user.

## Out of Scope

- User identification
- In-app log viewer
- Error alerting / notifications
- Log retention / cleanup policy
