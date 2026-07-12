import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './auth_context';
import PageTransition from '../components/motion/PageTransition';
import { canRoleAccessRoute } from './role_access';
import { useEffect, useState } from 'react';
import ApplicationIcon from './application_icon';

const NAVIGATION_SECTIONS = [
  { label: 'Overview', links: [{ to: '/dashboard', label: 'Dashboard', icon: 'dashboard' as const }] },
  { label: 'Fleet', links: [{ to: '/vehicles', label: 'Vehicles', icon: 'vehicles' as const }, { to: '/drivers', label: 'Drivers', icon: 'drivers' as const }, {to:'/vehicle-documents',label:'Documents',icon:'documents' as const}] },
  { label: 'Operations', links: [{ to: '/trips', label: 'Trips', icon: 'trips' as const }, { to: '/maintenance', label: 'Maintenance', icon: 'maintenance' as const }] },
  { label: 'Finance', links: [{ to: '/fuel-logs', label: 'Fuel Logs', icon: 'fuel' as const }, { to: '/expenses', label: 'Expenses', icon: 'expenses' as const }] },
  { label: 'Analytics', links: [{ to: '/reports', label: 'Reports', icon: 'reports' as const }] },
<<<<<<< HEAD
  { label: 'Administration', links: [{ to: '/admin', label: 'User Administration', icon: 'users' as const }] },
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
];

export default function ApplicationLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavigationOpen,setMobileNavigationOpen]=useState(false);
  const [darkMode,setDarkMode]=useState(()=>localStorage.getItem('transitops-theme')==='dark');
  useEffect(()=>{document.documentElement.dataset.mode=darkMode?'dark':'light';localStorage.setItem('transitops-theme',darkMode?'dark':'light');},[darkMode]);
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
      <button className="mobile-navigation-toggle" aria-label="Open navigation" onClick={()=>setMobileNavigationOpen(value=>!value)}>{mobileNavigationOpen?'×':'☰'}</button>
      {mobileNavigationOpen&&<button className="mobile-navigation-overlay" aria-label="Close navigation" onClick={()=>setMobileNavigationOpen(false)}/>}
      <nav className={`sidebar-navigation${mobileNavigationOpen?' mobile-open':''}`}>
        <div className="sidebar-brand"><img src="/transitops-logo.png" alt="TransitOps" /><div><h1>TransitOps</h1><span>Fleet Management</span></div></div>
        <div className="sidebar-navigation-links">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={()=>setMobileNavigationOpen(false)} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="sidebar-link-icon"><ApplicationIcon name={link.icon} /></span>{link.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="sidebar-user-info">
<<<<<<< HEAD
          <div onClick={()=>navigate('/profile')} style={{cursor:'pointer'}}><div className="sidebar-user-name">{user?.full_name}</div><div className="sidebar-user-role">{user?.role?.replaceAll('_', ' ')}</div></div>
=======
          <div><div className="sidebar-user-name">{user?.full_name}</div><div className="sidebar-user-role">{user?.role?.replaceAll('_', ' ')}</div></div>
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
          <div className="sidebar-user-actions"><button className="icon-button" aria-label="Toggle color theme" title="Toggle color theme" onClick={()=>setDarkMode(value=>!value)}><ApplicationIcon name={darkMode?'sun':'moon'} /></button><button className="icon-button" aria-label="Logout" title="Logout" onClick={handleLogout}><ApplicationIcon name="logout" /></button></div>
        </div>
      </nav>
      <main className="main-content"><PageTransition><Outlet /></PageTransition></main>
    </div>
  );
}
