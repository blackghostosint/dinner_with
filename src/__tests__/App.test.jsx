import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Welcome from '../pages/Welcome.jsx';
import { haversineDistance } from '../lib/utils.js';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
}));

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

describe('Welcome page', () => {
  it('renders the hero copy', () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Turning strangers into neighbors, one dinner at a time/i)).toBeDefined();
  });
});

describe('utils', () => {
  it('returns zero distance for identical coordinates', () => {
    const distance = haversineDistance(37.7749, -122.4194, 37.7749, -122.4194);
    expect(distance).toBeCloseTo(0, 3);
  });
});
