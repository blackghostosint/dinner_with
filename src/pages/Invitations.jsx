import Layout from '../components/Layout.jsx';
import InviteCard from '../components/InviteCard.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useInvitations } from '../hooks/useInvitations.js';

export default function Invitations() {
  const { user } = useAuth();
  const { invitations, loading, updateStatus } = useInvitations(user?.id);

  const handleStatus = async (id, status) => {
    try {
      await updateStatus(id, status);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Layout showTrust>
      <div className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Invitations</p>
          <h1 className="text-3xl font-semibold text-slate-900">Dinner plans</h1>
        </header>
        {loading && <p className="text-sm text-slate-500">Loading invites…</p>}
        {!loading && invitations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-500">
            No invites yet.
          </div>
        )}
        <div className="space-y-4">
          {invitations.map((invite) => (
            <div key={invite.id} className="space-y-3">
              <InviteCard invite={invite} />
              <div className="flex flex-wrap gap-3">
                {invite.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatus(invite.id, 'accepted')}
                      className="rounded-2xl bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatus(invite.id, 'declined')}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500"
                    >
                      Decline
                    </button>
                  </>
                )}
                {invite.status === 'accepted' && (
                  <button
                    onClick={() => handleStatus(invite.id, 'cancelled')}
                    className="rounded-2xl border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-red-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
