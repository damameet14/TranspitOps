<<<<<<< HEAD
type ApplicationIconName = 'dashboard' | 'vehicles' | 'drivers' | 'documents' | 'trips' | 'maintenance' | 'fuel' | 'expenses' | 'reports' | 'users' | 'sun' | 'moon' | 'logout';
=======
type ApplicationIconName = 'dashboard' | 'vehicles' | 'drivers' | 'documents' | 'trips' | 'maintenance' | 'fuel' | 'expenses' | 'reports' | 'sun' | 'moon' | 'logout';
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407

export default function ApplicationIcon({ name }: { name: ApplicationIconName }) {
  const paths: Record<ApplicationIconName, React.ReactNode> = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    vehicles: <><path d="M3 15V8.5A2.5 2.5 0 0 1 5.5 6h10.8a2 2 0 0 1 1.7.9l2.8 4.4V17H19"/><path d="M3 17h2m4 0h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></>,
    drivers: <><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></>,
    documents: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    trips: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    maintenance: <><path d="m14.7 6.3 3-3a4 4 0 0 1-5 5L5 16l-2 5 5-2 7.7-7.7a4 4 0 0 1 5-5l-3 3z"/></>,
    fuel: <><path d="M5 22V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v18M3 22h15M8 6h5v5H8z"/><path d="m16 7 3 3v7a2 2 0 0 0 4 0V9l-2-2"/></>,
    expenses: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    reports: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
<<<<<<< HEAD
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/></>,
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z"/>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
  };

  return <svg className="application-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
