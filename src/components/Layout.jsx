import TrustBanner from './TrustBanner.jsx';

export default function Layout({ children, showTrust = false }) {
  return (
    <div className="min-h-screen text-slate-900" style={{backgroundColor: '#fdf8f0'}}>
      <div className="mx-auto flex max-w-5xl flex-col px-4 pb-28 pt-6">
        {showTrust && <TrustBanner />}
        <main id="main-content" className="flex-1 pt-4">{children}</main>
      </div>
    </div>
  );
}
