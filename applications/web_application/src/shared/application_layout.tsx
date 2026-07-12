import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth_context';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    ],
  },
  {
    label: 'Fleet',
    links: [
      { to: '/vehicles', label: 'Vehicles', icon: '🚛' },
      { to: '/drivers', label: 'Drivers', icon: '👤' },
    ],
  },
  {
    label: 'Operations',
    links: [
      { to: '/trips', label: 'Trips', icon: '🗺️' },
      { to: '/maintenance', label: 'Maintenance', icon: '🔧' },
    ],
  },
  {
    label: 'Finance',
    links: [
      { to: '/fuel-logs', label: 'Fuel Logs', icon: '⛽' },
      { to: '/expenses', label: 'Expenses', icon: '💰' },
    ],
  },
  {
    label: 'Analytics',
    links: [
      { to: '/reports', label: 'Reports', icon: '📈' },
    ],
  },
];

export default function ApplicationLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="application-layout">
      <nav className="sidebar-navigation">
        <div className="sidebar-brand">
          <h1>TransitOps</h1>
          <span>Smart Transport Platform</span>
        </div>

        <div className="sidebar-navigation-links">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link${isActive ? ' active' : ''}`
                  }
                >
                  <span className="sidebar-link-icon">{link.icon}</span>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-user-info">
          <div>
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{user?.role?.replace('_', ' ')}</div>
          </div>
          <button className="button button-small button-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
