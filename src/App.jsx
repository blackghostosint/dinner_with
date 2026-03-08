import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useProfile } from './hooks/useProfile.js';
import CreateInvite from './pages/CreateInvite.jsx';
import Invitations from './pages/Invitations.jsx';
import Nearby from './pages/Nearby.jsx';
import OnboardingProfile from './pages/OnboardingProfile.jsx';
import OnboardingRole from './pages/OnboardingRole.jsx';
import OnboardingSignUp from './pages/OnboardingSignUp.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';
import RestaurantPicker from './pages/RestaurantPicker.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Welcome from './pages/Welcome.jsx';
import PageTransition from './components/PageTransition.jsx';

function ProtectedRoute({ children, skipProfileCheck = false }) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedProfile, loading: profileLoading } = useProfile(user?.id);

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#fdf8f0' }}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" aria-label="Loading" role="status" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!skipProfileCheck && !hasCompletedProfile) {
    return <Navigate to="/onboarding/profile" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Welcome /></PageTransition>} />
        <Route path="/onboarding/role" element={<PageTransition><OnboardingRole /></PageTransition>} />
        <Route path="/onboarding/signup" element={<PageTransition><OnboardingSignUp /></PageTransition>} />
        <Route
          path="/onboarding/profile"
          element={
            <ProtectedRoute skipProfileCheck>
              <PageTransition><OnboardingProfile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby"
          element={
            <ProtectedRoute>
              <PageTransition><Nearby /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <PageTransition><UserProfile /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurants/pick"
          element={
            <ProtectedRoute>
              <PageTransition><RestaurantPicker /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations/create"
          element={
            <ProtectedRoute>
              <PageTransition><CreateInvite /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <PageTransition><Invitations /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PageTransition><ProfileEdit /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
