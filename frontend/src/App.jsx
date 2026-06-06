import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';

// ── Route guard: redirect to /auth if not logged in ───────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();

  // Still verifying token — show nothing (or a spinner)
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="sh-spinner dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// ── Route guard: redirect away from /auth if already logged in ────────────────
const PublicRoute = ({ children }) => {
  const { isAuthenticated, authChecked } = useAuth();

  if (!authChecked) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <span className="sh-spinner dark" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// ══════════════════════════════════════════════════════════════════════════════
// App
// ══════════════════════════════════════════════════════════════════════════════
const App = () => {
  return (
    <Routes>
      {/* Public: Feed is viewable by everyone, but post/like requires login */}
      <Route path="/" element={<FeedPage />} />

      {/* Auth page — redirect if already logged in */}
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
