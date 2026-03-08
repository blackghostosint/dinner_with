import { describe, it, expect, vi, beforeEach } from 'vitest';

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
});
