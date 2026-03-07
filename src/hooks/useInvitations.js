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
    supabase
      .from('invitations')
      .select('*')
      .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`)
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError);
          setInvitations([]);
        } else {
          const sorted = (data ?? []).sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
          setInvitations(sorted);
        }
        setLoading(false);
      });
  }, [userId]);

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

  return { invitations, loading, error, updateStatus };
}
