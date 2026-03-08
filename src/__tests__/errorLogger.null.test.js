// src/__tests__/errorLogger.null.test.js
import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/supabase.js', () => ({
  supabase: null,
}));

import { logError } from '../lib/errorLogger.js';

describe('logError with null supabase', () => {
  it('does nothing when supabase is null', async () => {
    await expect(logError(new Error('x'), 'manual')).resolves.toBeUndefined();
  });
});
