import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth_context';
import PageTransition from '../components/motion/PageTransition';
import { canRoleAccessRoute } from './role_access';

const NAVIGATION_SECTIONS = [
  { label: 'Overview', links: [{ to: '/dashboard', label: 'Dashboard', icon: 'DB' }] },
  { label: 'Fleet', links: [{ to: '/vehicles', label: 'Vehicles', icon: 'VH' }, { to: '/drivers', label: 'Drivers', icon: 'DR' }] },
  { label: 'Operations', links: [{ to: '/trips', label: 'Trips', icon: 'TR' }, { to: '/maintenance', label: 'Maintenance', icon: 'MT' }] },
  { label: 'Finance', links: [{ to: '/fuel-logs', label: 'Fuel Logs', icon: 'FL' }, { to: '/expenses', label: 'Expenses', icon: 'EX' }] },
  { label: 'Analytics', links: [{ to: '/reports', label: 'Reports', icon: 'RP' }] },
];

export default function ApplicationLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const visibleSections = NAVIGATION_SECTIONS.map((section) => ({
    ...section,
    links: section.links.filter((link) => canRoleAccessRoute(user?.role, link.to)),
  })).filter((section) => section.links.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="application-layout">
      <nav className="sidebar-navigation">
        <div className="sidebar-brand"><h1>TransitOps</h1><span>Smart Transport Platform</span></div>
        <div className="sidebar-navigation-links">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map((link) => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="sidebar-link-icon">{link.icon}</span>{link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-user-info">
          <div><div className="sidebar-user-name">{user?.full_name}</div><div className="sidebar-user-role">{user?.role?.replaceAll('_', ' ')}</div></div>
          <button className="button button-small button-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <main className="main-content"><PageTransition><Outlet /></PageTransition></main>
    </div>
  );
}
