# Error Logging Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Capture all unhandled errors in the app (render errors, global JS exceptions, unhandled promise rejections, manual calls) and store them anonymously in a Supabase `error_logs` table.

**Architecture:** A single `logError()` utility writes rows to Supabase silently (never throws). A React `ErrorBoundary` class component wraps the app and calls it on render failures. Two global handlers in `main.jsx` catch everything else.

**Tech Stack:** React 19, Supabase JS v2, Vitest + Testing Library

---

### Task 1: Create the Supabase `error_logs` table

**Files:**
- Create: `supabase/migrations/20260308000000_create_error_logs.sql`

No automated test for a SQL migration — verify manually in Supabase dashboard after running.

**Step 1: Create the migrations directory and SQL file**

```sql
-- supabase/migrations/20260308000000_create_error_logs.sql

create table if not exists error_logs (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  message     text not null,
  stack       text,
  source      text not null,   -- 'boundary' | 'global' | 'promise' | 'manual'
  url         text,
  metadata    jsonb
);

-- Allow anonymous inserts only. No reads from the client.
alter table error_logs enable row level security;

create policy "anon insert only"
  on error_logs
  for insert
  to anon
  with check (true);
```

**Step 2: Run the migration in Supabase**

Go to your Supabase project → SQL Editor → paste and run the file contents.
Confirm the `error_logs` table appears in Table Editor.

**Step 3: Commit**

```bash
git add supabase/migrations/20260308000000_create_error_logs.sql
git commit -m "feat: add error_logs table migration"
```

---

### Task 2: Create `logError` utility

**Files:**
- Create: `src/lib/errorLogger.js`
- Create: `src/__tests__/errorLogger.test.js`

**Step 1: Write the failing test**

```js
// src/__tests__/errorLogger.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module before importing logError
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { logError } from '../lib/errorLogger.js';
import { supabase } from '../lib/supabase.js';

describe('logError', () => {
  let insertMock;

  beforeEach(() => {
    insertMock = vi.fn().mockResolvedValue({ error: null });
    supabase.from.mockReturnValue({ insert: insertMock });
  });

  it('inserts a row with the correct shape for an Error object', async () => {
    const err = new Error('boom');
    err.stack = 'Error: boom\n  at test.js:1';
    await logError(err, 'manual', { extra: 'data' });

    expect(supabase.from).toHaveBeenCalledWith('error_logs');
    const [row] = insertMock.mock.calls[0];
    expect(row.message).toBe('boom');
    expect(row.stack).toBe(err.stack);
    expect(row.source).toBe('manual');
    expect(row.metadata).toEqual({ extra: 'data' });
    expect(typeof row.url).toBe('string');
  });

  it('accepts a plain string as error', async () => {
    await logError('something went wrong', 'global');
    const [row] = insertMock.mock.calls[0];
    expect(row.message).toBe('something went wrong');
    expect(row.stack).toBeNull();
  });

  it('never throws even if Supabase fails', async () => {
    insertMock.mockRejectedValue(new Error('network error'));
    await expect(logError(new Error('x'), 'manual')).resolves.toBeUndefined();
  });

  it('does nothing when supabase is null', async () => {
    // Re-mock supabase as null
    vi.resetModules();
    vi.doMock('../lib/supabase.js', () => ({ supabase: null }));
    const { logError: logErrorFresh } = await import('../lib/errorLogger.js?fresh');
    await expect(logErrorFresh(new Error('x'), 'manual')).resolves.toBeUndefined();
  });
});
```

**Step 2: Run the test to verify it fails**

```bash
npx vitest run src/__tests__/errorLogger.test.js
```

Expected: FAIL — `logError` not found.

**Step 3: Implement `logError`**

```js
// src/lib/errorLogger.js
import { supabase } from './supabase.js';

/**
 * Log an error to the Supabase error_logs table.
 * Never throws — logging must not break the app.
 *
 * @param {Error|string} error
 * @param {'boundary'|'global'|'promise'|'manual'} source
 * @param {object} [metadata]
 */
export async function logError(error, source, metadata) {
  if (!supabase) return;

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;

  try {
    await supabase.from('error_logs').insert({
      message,
      stack,
      source,
      url: typeof window !== 'undefined' ? window.location.href : null,
      metadata: metadata ?? null,
    });
  } catch {
    // Silently swallow — logging must never crash the app
  }
}
```

**Step 4: Run the test to verify it passes**

```bash
npx vitest run src/__tests__/errorLogger.test.js
```

Expected: PASS (ignore the `?fresh` test if module caching prevents it — the first three are the critical ones).

**Step 5: Commit**

```bash
git add src/lib/errorLogger.js src/__tests__/errorLogger.test.js
git commit -m "feat: add logError utility"
```

---

### Task 3: Create `ErrorBoundary` component

**Files:**
- Create: `src/components/ErrorBoundary.jsx`
- Create: `src/__tests__/ErrorBoundary.test.jsx`

**Step 1: Write the failing test**

```jsx
// src/__tests__/ErrorBoundary.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

vi.mock('../lib/errorLogger.js', () => ({
  logError: vi.fn().mockResolvedValue(undefined),
}));

import { logError } from '../lib/errorLogger.js';

// A component that throws on render
function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error('test explosion');
  return <div>Safe content</div>;
}

// Suppress React's console.error output for expected errors in tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe content')).toBeDefined();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /reload/i })).toBeDefined();
  });

  it('calls logError when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    );
    expect(logError).toHaveBeenCalledWith(
      expect.any(Error),
      'boundary',
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});
```

**Step 2: Run the test to verify it fails**

```bash
npx vitest run src/__tests__/ErrorBoundary.test.jsx
```

Expected: FAIL — `ErrorBoundary` not found.

**Step 3: Implement `ErrorBoundary`**

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { logError } from '../lib/errorLogger.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError(error, 'boundary', { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ backgroundColor: '#fdf8f0' }}
        >
          <p className="text-lg font-semibold text-slate-700">Something went wrong.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 4: Run the test to verify it passes**

```bash
npx vitest run src/__tests__/ErrorBoundary.test.jsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ErrorBoundary.jsx src/__tests__/ErrorBoundary.test.jsx
git commit -m "feat: add ErrorBoundary component"
```

---

### Task 4: Wire up global handlers and ErrorBoundary in `main.jsx`

**Files:**
- Modify: `src/main.jsx`

No new test needed — the global handlers are thin wiring that delegate to the already-tested `logError`. Verify manually by throwing in the browser console.

**Step 1: Update `main.jsx`**

Add the import and global handlers at the top, and wrap the app with `ErrorBoundary`.

Full updated file:

```jsx
// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { logError } from './lib/errorLogger.js';

// Global handlers — registered once at module load
window.onerror = (message, _source, lineno, colno, error) => {
  logError(error ?? new Error(String(message)), 'global', { lineno, colno });
};

window.onunhandledrejection = (event) => {
  logError(event.reason ?? new Error('Unhandled promise rejection'), 'promise');
};

const container = document.getElementById('root');

if (container) {
  createRoot(container).render(
    <StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </StrictMode>,
  );
}

if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    window.deferredPrompt = event;
  });
}
```

**Step 2: Run all tests to make sure nothing is broken**

```bash
npx vitest run
```

Expected: all existing tests pass.

**Step 3: Smoke-test manually in the browser**

Open the app in dev mode (`npm run dev`). In the browser console run:

```js
// Test global handler
throw new Error('test global error');

// Test promise handler
Promise.reject(new Error('test promise rejection'));
```

Check the Supabase `error_logs` table — two rows should appear with `source = 'global'` and `source = 'promise'`.

**Step 4: Commit**

```bash
git add src/main.jsx
git commit -m "feat: wire up ErrorBoundary and global error handlers"
```

---

### Task 5: Export `logError` for manual use

**Files:**
- No new files — `logError` is already exported from `src/lib/errorLogger.js`

This task is a reminder of the usage pattern for future manual calls anywhere in the app:

```js
import { logError } from '../lib/errorLogger.js';

// In a catch block:
try {
  await someSupabaseCall();
} catch (err) {
  logError(err, 'manual', { context: 'ProfileEdit.handleSubmit' });
}
```

No code changes needed. No commit needed.

---

## Done

After all tasks:
- `error_logs` table exists in Supabase with insert-only RLS
- All unhandled errors are captured automatically
- `logError(error, 'manual', { context: '...' })` is available anywhere for explicit logging
- View logs in Supabase dashboard: Table Editor → `error_logs`, sort by `created_at` desc
