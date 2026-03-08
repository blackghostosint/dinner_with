import { supabase } from './supabase.js';

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
