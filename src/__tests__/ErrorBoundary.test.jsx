import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

vi.mock('../lib/errorLogger.js', () => ({
  logError: vi.fn().mockResolvedValue(undefined),
}));

import { logError } from '../lib/errorLogger.js';

function Bomb({ shouldThrow }) {
  if (shouldThrow) throw new Error('test explosion');
  return <div>Safe content</div>;
}

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
