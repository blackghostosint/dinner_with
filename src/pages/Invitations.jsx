import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import InviteCard from '../components/InviteCard.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useInvitations } from '../hooks/useInvitations.js';

const TABS = ['pending', 'accepted', 'declined', 'cancelled'];

export default function Invitations() {
  const { user } = useAuth();
  const { invitations, loading, updateStatus } = useInvitations(user?.id);
  const [activeTab, setActiveTab] = useState('pending');

  const handleStatus = async (id, status) => {
    try { await updateStatus(id, status); } catch (e) { console.error(e); }
  };

  const filtered = invitations.filter((inv) => inv.status === activeTab);

  return (
    <Layout showTrust>
      <div className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Invitations</p>
          <h1 className="text-3xl font-semibold text-slate-900">Dinner plans</h1>
        </header>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const count = invitations.filter((inv) => inv.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'border border-slate-200 text-slate-500'
                }`}
              >
                {tab} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {loading && <p className="text-sm text-slate-500">Loading invites…</p>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center text-sm text-slate-500">
            No {activeTab} invitations.
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((invite) => {
            const isHost = invite.host_user_id === user?.id;
            const isGuest = invite.guest_user_id === user?.id;
            return (
              <div key={invite.id} className="space-y-3">
                <InviteCard invite={invite} currentUserId={user?.id} />
                <div className="flex flex-wrap gap-3">
                  {invite.status === 'pending' && isGuest && (
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
                  {invite.status === 'pending' && isHost && (
                    <button
                      onClick={() => handleStatus(invite.id, 'cancelled')}
                      className="rounded-2xl border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                  {invite.status === 'accepted' && (isHost || isGuest) && (
                    <button
                      onClick={() => handleStatus(invite.id, 'cancelled')}
                      className="rounded-2xl border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-red-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </Layout>
  );
}
