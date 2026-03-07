import React from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nearby from '../pages/Nearby.jsx';

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: { id: 'host-1' }, loading: false }),
}));

vi.mock('../hooks/useProfile.js', () => ({
  useProfile: () => ({ profile: { role: 'host', lat: 45, lng: -122 }, loading: false }),
}));

vi.mock('../hooks/useNearby.js', () => ({
  useNearby: () => globalThis.__TEST_NEARBY_STATE__ ?? { nearby: [], loading: false, error: null, hasNearby: false },
}));

vi.mock('../hooks/useRestaurants.js', () => ({
  useRestaurants: () => globalThis.__TEST_RESTAURANTS_STATE__ ?? { restaurants: [], loading: false },
}));

vi.mock('../components/MapView.jsx', () => ({
  __esModule: true,
  default: (props) => <div data-testid="map-view">{JSON.stringify(props.markers)}</div>,
}));

describe('Nearby page', () => {
  beforeEach(() => {
    globalThis.__TEST_NEARBY_STATE__ = {
      nearby: [
        { id: 'guest-1', name: 'Claire', distance: 2.1, city: 'Portland', state: 'OR', bio: 'Loves conversation', role: 'guest' },
        { id: 'guest-2', name: 'Jordan', distance: 4.5, city: 'Portland', state: 'OR', bio: 'Enjoys neighborhoods', role: 'guest' },
      ],
      loading: false,
      error: null,
      hasNearby: true,
    };
    globalThis.__TEST_RESTAURANTS_STATE__ = { restaurants: [], loading: false };
  });

  it('renders the map view with supplied markers', () => {
    render(
      <MemoryRouter>
        <Nearby />
      </MemoryRouter>,
    );

    expect(screen.getByText(/People nearby/i)).toBeTruthy();
    const map = screen.getByTestId('map-view');
    expect(map.textContent).toContain('Claire');
    expect(map.textContent).toContain('Jordan');
  });

  it('shows list view cards when toggled', () => {
    render(
      <MemoryRouter>
        <Nearby />
      </MemoryRouter>,
    );

    const listButton = screen.getByRole('button', { name: /list/i });
    fireEvent.click(listButton);

    expect(screen.getByText('Claire')).toBeTruthy();
    expect(screen.getByText('Jordan')).toBeTruthy();
  });
});
