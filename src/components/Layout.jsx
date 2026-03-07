import TrustBanner from './TrustBanner.jsx';

export default function Layout({ children, showTrust = false }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col px-4 pb-10 pt-6">
        {showTrust && <TrustBanner />}
        <main className="flex-1 pt-4">{children}</main>
      </div>
    </div>
  );
}
