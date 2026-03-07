import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import InviteCard from '../components/InviteCard.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useInvitations } from '../hooks/useInvitations.js';

const TABS = ['pending', 'accepted', 'declined', 'cancelled'];

export default function Invitations() {
  const { user } = useAuth();
  const { invitations, loading, updateStatus, sharePhone } = useInvitations(user?.id);
  const [activeTab, setActiveTab] = useState('pending');

  const handleStatus = async (id, status) => {
    try { await updateStatus(id, status); } catch (e) { console.error(e); }
  };

  const handleSharePhone = async (id, role) => {
    try { await sharePhone(id, role); } catch (e) { console.error(e); }
  };

  const filtered = invitations.filter((inv) => inv.status === activeTab);

  return (
    <Layout showTrust>
      <div className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Your table</p>
          <h1 className="text-3xl text-slate-900">Dinner plans</h1>
        </header>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const count = invitations.filter((inv) => inv.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`min-h-[44px] rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white'
                    : 'border-2 border-amber-100 text-slate-500 hover:border-amber-300'
                }`}
              >
                {tab} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {loading && <p className="text-sm text-slate-500">Loading invites…</p>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-amber-100 bg-white p-8 text-center">
            <p className="text-base font-semibold text-slate-700">No {activeTab} invitations</p>
            <p className="mt-1 text-sm text-slate-400">
              {activeTab === 'pending' ? 'Invitations you send or receive will appear here.' : 'Nothing here yet.'}
            </p>
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

                {invite.status === 'accepted' && (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-3">
                    <p className="text-xs uppercase tracking-[0.4em] text-amber-500">Contact sharing</p>
                    {isHost && (
                      <div className="space-y-2">
                        {invite.host_shared_phone ? (
                          <p className="text-slate-500">You shared your number with {invite.guest?.name}.</p>
                        ) : (
                          <button
                            onClick={() => handleSharePhone(invite.id, 'host')}
                            className="min-h-[44px] rounded-2xl border-2 border-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-700 hover:bg-amber-100 transition-all duration-200 cursor-pointer"
                          >
                            Share my number with {invite.guest?.name}
                          </button>
                        )}
                        {invite.guest_shared_phone && invite.guest?.phone && (
                          <p className="font-semibold text-slate-700">{invite.guest?.name}: <a href={`tel:${invite.guest.phone}`} className="text-amber-600 underline">{invite.guest.phone}</a></p>
                        )}
                        {invite.guest_shared_phone && !invite.guest?.phone && (
                          <p className="text-slate-400">{invite.guest?.name} shared their number but hasn't added one to their profile yet.</p>
                        )}
                      </div>
                    )}
                    {isGuest && (
                      <div className="space-y-2">
                        {invite.guest_shared_phone ? (
                          <p className="text-slate-500">You shared your number with {invite.host?.name}.</p>
                        ) : (
                          <button
                            onClick={() => handleSharePhone(invite.id, 'guest')}
                            className="min-h-[44px] rounded-2xl border-2 border-amber-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-amber-700 hover:bg-amber-100 transition-all duration-200 cursor-pointer"
                          >
                            Share my number with {invite.host?.name}
                          </button>
                        )}
                        {invite.host_shared_phone && invite.host?.phone && (
                          <p className="font-semibold text-slate-700">{invite.host?.name}: <a href={`tel:${invite.host.phone}`} className="text-amber-600 underline">{invite.host.phone}</a></p>
                        )}
                        {invite.host_shared_phone && !invite.host?.phone && (
                          <p className="text-slate-400">{invite.host?.name} shared their number but hasn't added one to their profile yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </Layout>
  );
}
