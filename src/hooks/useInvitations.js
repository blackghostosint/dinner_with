import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function useInvitations(userId) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !supabase) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchAll = async () => {
      const { data: invData, error: invError } = await supabase
        .from('invitations')
        .select('*, restaurant:restaurants(name, address), host_shared_phone, guest_shared_phone')
        .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`);

      if (invError) { setError(invError); setInvitations([]); setLoading(false); return; }

      const userIds = [...new Set(
        (invData ?? []).flatMap((inv) => [inv.host_user_id, inv.guest_user_id])
      )];

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, name, city, state, phone')
        .in('id', userIds);

      const profileMap = Object.fromEntries((profileData ?? []).map((p) => [p.id, p]));

      const merged = (invData ?? [])
        .map((inv) => ({
          ...inv,
          host: profileMap[inv.host_user_id] ?? null,
          guest: profileMap[inv.guest_user_id] ?? null,
        }))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setInvitations(merged);
      setLoading(false);
    };

    fetchAll();
  }, [userId]);

  const sharePhone = async (invitationId, role) => {
    if (!supabase) throw new Error('Supabase client not configured');
    const field = role === 'host' ? 'host_shared_phone' : 'guest_shared_phone';
    const { error } = await supabase
      .from('invitations')
      .update({ [field]: true })
      .eq('id', invitationId);
    if (error) throw error;
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, [field]: true } : inv)),
    );
  };

  const updateStatus = async (invitationId, status) => {
    if (!supabase) {
      throw new Error('Supabase client not configured');
    }
    const { error } = await supabase
      .from('invitations')
      .update({ status })
      .eq('id', invitationId);
    if (error) {
      throw error;
    }
    setInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status } : inv)),
    );
    return status;
  };

  return { invitations, loading, error, updateStatus, sharePhone };
}
