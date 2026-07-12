import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './shared/auth_context';
import ApplicationLayout from './shared/application_layout';
import LoginPage from './pages/login_page';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
          <Route element={<ProtectedRoute><ApplicationLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="drivers" element={<DriversPage />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="fuel-logs" element={<FuelLogsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="reports" element={<ReportsPage />} />
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
