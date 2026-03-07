import { Navigate, Route, Routes } from 'react-router-dom';
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

function ProtectedRoute({ children, skipProfileCheck = false }) {
  const { user, loading: authLoading } = useAuth();
  const { hasCompletedProfile, loading: profileLoading } = useProfile(user?.id);

  if (authLoading || profileLoading) {
    return <div className="flex justify-center py-10 text-sm text-slate-500">Loading auth…</div>;
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
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/onboarding/role" element={<OnboardingRole />} />
      <Route path="/onboarding/signup" element={<OnboardingSignUp />} />
      <Route
        path="/onboarding/profile"
        element={
          <ProtectedRoute skipProfileCheck>
            <OnboardingProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nearby"
        element={
          <ProtectedRoute>
            <Nearby />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/restaurants/pick"
        element={
          <ProtectedRoute>
            <RestaurantPicker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations/create"
        element={
          <ProtectedRoute>
            <CreateInvite />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations"
        element={
          <ProtectedRoute>
            <Invitations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
