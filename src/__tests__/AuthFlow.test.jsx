import React from 'react';
import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Welcome from '../pages/Welcome.jsx';
import { supabase } from '../lib/supabase.js';

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
    },
  },
}));

describe('Welcome auth flows', () => {
  beforeEach(() => {
    supabase.auth.signInWithPassword.mockReset().mockResolvedValue({ error: null });
    supabase.auth.signInWithOtp.mockReset().mockResolvedValue({ error: null });
  });

  it('calls password sign-in when the password field is filled', async () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'host@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'demo123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'host@example.com',
      password: 'demo123',
    }));
    expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it('hits the magic-link flow when the password is empty', async () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i), {
      target: { value: 'guest@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send link/i }));

    await waitFor(() => expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'guest@example.com' }));
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
