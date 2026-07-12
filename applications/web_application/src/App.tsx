import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/auth_context';
import ApplicationLayout from './shared/application_layout';
import LoginPage from './pages/login_page';
import RegistrationPage from './pages/registration_page';
import LandingPage from './pages/landing_page';
import DashboardPage from './pages/dashboard_page';
import VehiclesPage from './pages/vehicles_page';
import DriversPage from './pages/drivers_page';
import TripsPage from './pages/trips_page';
import MaintenancePage from './pages/maintenance_page';
import FuelLogsPage from './pages/fuel_logs_page';
import ExpensesPage from './pages/expenses_page';
import ReportsPage from './pages/reports_page';
import CursorFollower from './components/motion/CursorFollower';
import MotionDebugPanel from './components/motion/MotionDebugPanel';
import { useEffect } from 'react';
import { markAsHydrated } from './animation/animationRegistry';
import { canRoleAccessRoute } from './shared/role_access';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function RoleProtectedRoute({ route, children }: { route: string; children: React.ReactNode }) {
  const { user } = useAuth();
  return canRoleAccessRoute(user?.role, route) ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function App() {
  useEffect(() => {
    markAsHydrated();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route element={<ProtectedRoute><ApplicationLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="vehicles" element={<RoleProtectedRoute route="/vehicles"><VehiclesPage /></RoleProtectedRoute>} />
            <Route path="drivers" element={<RoleProtectedRoute route="/drivers"><DriversPage /></RoleProtectedRoute>} />
            <Route path="trips" element={<RoleProtectedRoute route="/trips"><TripsPage /></RoleProtectedRoute>} />
            <Route path="maintenance" element={<RoleProtectedRoute route="/maintenance"><MaintenancePage /></RoleProtectedRoute>} />
            <Route path="fuel-logs" element={<RoleProtectedRoute route="/fuel-logs"><FuelLogsPage /></RoleProtectedRoute>} />
            <Route path="expenses" element={<RoleProtectedRoute route="/expenses"><ExpensesPage /></RoleProtectedRoute>} />
            <Route path="reports" element={<RoleProtectedRoute route="/reports"><ReportsPage /></RoleProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CursorFollower />
        <MotionDebugPanel />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
