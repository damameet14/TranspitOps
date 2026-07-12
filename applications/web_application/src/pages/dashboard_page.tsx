import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { getResolvedMotionLevel } from '../animation/reducedMotion';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';
<<<<<<< HEAD
import { useAuth } from '../shared/auth_context';
=======
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407

interface DashboardKpis {
  total_vehicles: number;
  total_drivers: number;
  total_trips: number;
  active_trips: number;
  pending_trips: number;
  active_vehicles: number;
  drivers_on_duty: number;
  completed_trips: number;
  cancelled_trips: number;
  total_revenue: number;
  total_fuel_cost: number;
  total_expenses: number;
  total_maintenance_cost: number;
  fleet_utilization_percent: number;
  average_safety_score: number;
  drivers_with_expired_license: number;
  fleet_status: { available: number; on_trip: number; in_shop: number; retired: number };
  driver_status: { available: number; on_trip: number; off_duty: number; suspended: number };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [filters, setFilters] = useState({ vehicle_type: '', vehicle_status: '', region: '' });

  useEffect(() => {
    apiClient.get('/dashboard/kpis', { params: Object.fromEntries(Object.entries(filters).filter(([, value]) => value)) })
      .then((res) => setKpis(res.data))
      .catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Dashboard metrics could not be loaded.')))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    apiClient.get('/vehicles/regions').then(response => setRegions(response.data)).catch(() => setRegions([]));
  }, []);

  if (loading) return <div className="page-content"><p className="text-muted">Loading dashboard...</p></div>;
  if (!kpis) return <div className="page-content"><FeedbackCard message={feedbackMessage || 'Dashboard metrics could not be loaded.'} /></div>;

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  const roleDashboardCards: Array<[string, string | number]> = user?.role === 'driver'
    ? [['My Active Trips', kpis.active_trips], ['My Pending Trips', kpis.pending_trips], ['My Completed Trips', kpis.completed_trips], ['My Safety Score', kpis.average_safety_score]]
    : user?.role === 'safety_officer'
      ? [['Drivers On Duty', kpis.drivers_on_duty], ['Average Safety Score', kpis.average_safety_score], ['Expired Licenses', kpis.drivers_with_expired_license], ['Vehicles In Maintenance', kpis.fleet_status.in_shop]]
      : user?.role === 'financial_analyst'
        ? [['Completed Trips', kpis.completed_trips], ['Revenue', formatCurrency(kpis.total_revenue)], ['Fuel Cost', formatCurrency(kpis.total_fuel_cost)], ['Operating Expenses', formatCurrency(kpis.total_expenses)], ['Maintenance Cost', formatCurrency(kpis.total_maintenance_cost)]]
        : user?.role === 'admin'
          ? [['Active Vehicles', kpis.active_vehicles], ['Drivers On Duty', kpis.drivers_on_duty], ['Pending Trips', kpis.pending_trips], ['Completed Trips', kpis.completed_trips], ['Fleet Utilization', `${kpis.fleet_utilization_percent}%`], ['Revenue', formatCurrency(kpis.total_revenue)], ['Fuel Cost', formatCurrency(kpis.total_fuel_cost)], ['Expenses', formatCurrency(kpis.total_expenses)], ['Maintenance Cost', formatCurrency(kpis.total_maintenance_cost)]]
          : [['Active Vehicles', kpis.active_vehicles], ['Drivers On Duty', kpis.drivers_on_duty], ['Pending Trips', kpis.pending_trips], ['Active Trips', kpis.active_trips], ['Completed Trips', kpis.completed_trips], ['Fleet Utilization', `${kpis.fleet_utilization_percent}%`]];

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">{user?.role === 'admin' ? 'Executive Dashboard' : user?.role === 'driver' ? 'My Driver Dashboard' : user?.role === 'safety_officer' ? 'Safety & Compliance Dashboard' : user?.role === 'financial_analyst' ? 'Financial Dashboard' : 'Fleet Operations Dashboard'}</h2>
      </div>
      <div className="page-content">
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
<<<<<<< HEAD
        {(user?.role === 'fleet_manager' || user?.role === 'admin') && <div className="card mb-6">
=======
        <div className="card mb-6">
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
          <div className="form-row">
            <div className="form-group"><label className="form-label">Vehicle Type</label><select className="form-select" value={filters.vehicle_type} onChange={event => setFilters({...filters, vehicle_type:event.target.value})}><option value="">All types</option><option value="truck">Truck</option><option value="van">Van</option><option value="bus">Bus</option><option value="bike">Bike</option></select></div>
            <div className="form-group"><label className="form-label">Vehicle Status</label><select className="form-select" value={filters.vehicle_status} onChange={event => setFilters({...filters, vehicle_status:event.target.value})}><option value="">All statuses</option><option value="available">Available</option><option value="on_trip">On trip</option><option value="in_shop">In shop</option><option value="retired">Retired</option></select></div>
            <div className="form-group"><label className="form-label">Region</label><select className="form-select" value={filters.region} onChange={event => setFilters({...filters, region:event.target.value})}><option value="">All regions</option>{regions.map(region => <option key={region} value={region}>{region}</option>)}</select></div>
          </div>
<<<<<<< HEAD
        </div>}
        {/* KPI Cards */}
        <div className="kpi-grid">
          {roleDashboardCards.map(([label, value]) => <KpiCard key={label} label={label} value={value} />)}
=======
        </div>
        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard label="Active Vehicles" value={kpis.active_vehicles} />
          <KpiCard label="Drivers On Duty" value={kpis.drivers_on_duty} />
          <KpiCard label="Pending Trips" value={kpis.pending_trips} />
          <KpiCard label="Active Trips" value={kpis.active_trips} />
          <KpiCard label="Completed Trips" value={kpis.completed_trips} />
          <KpiCard label="Fleet Utilization" value={`${kpis.fleet_utilization_percent}%`} />
          <KpiCard label="Avg Safety Score" value={kpis.average_safety_score} />
          <KpiCard label="Total Revenue" value={formatCurrency(kpis.total_revenue)} />
          <KpiCard label="Total Fuel Cost" value={formatCurrency(kpis.total_fuel_cost)} />
          <KpiCard label="Total Expenses" value={formatCurrency(kpis.total_expenses)} />
          <KpiCard label="Maintenance Cost" value={formatCurrency(kpis.total_maintenance_cost)} />
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
        </div>

        {/* Status Breakdowns */}
        {(user?.role === 'admin' || user?.role === 'fleet_manager' || user?.role === 'safety_officer') && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)' }}>
          <div className="card">
            <div className="card-header"><h3 className="card-title">Fleet Status</h3></div>
            <StatusRow label="Available" count={kpis.fleet_status.available} badgeClass="status-badge-available" />
            <StatusRow label="On Trip" count={kpis.fleet_status.on_trip} badgeClass="status-badge-on_trip" />
            <StatusRow label="In Shop" count={kpis.fleet_status.in_shop} badgeClass="status-badge-in_shop" />
            <StatusRow label="Retired" count={kpis.fleet_status.retired} badgeClass="status-badge-retired" />
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Driver Status</h3></div>
            <StatusRow label="Available" count={kpis.driver_status.available} badgeClass="status-badge-available" />
            <StatusRow label="On Trip" count={kpis.driver_status.on_trip} badgeClass="status-badge-on_trip" />
            <StatusRow label="Off Duty" count={kpis.driver_status.off_duty} badgeClass="status-badge-off_duty" />
            <StatusRow label="Suspended" count={kpis.driver_status.suspended} badgeClass="status-badge-suspended" />
            {kpis.drivers_with_expired_license > 0 && (
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--feedback-warning-background)', borderRadius: 'var(--radius-control)', fontSize: 'var(--font-size-small)', color: 'var(--feedback-warning-text)' }}>
                ⚠ {kpis.drivers_with_expired_license} driver(s) with expired license
              </div>
            )}
          </div>
        </div>}
      </div>
    </>
  );
}

function AnimatedKpiValue({ value }: { value: string | number }) {
  const [displayValue, setDisplayValue] = useState<string | number>(value);
  const level = getResolvedMotionLevel();

  useEffect(() => {
    const numericStr = String(value).replace(/[^0-9.]/g, '');
    const num = parseFloat(numericStr);
    if (isNaN(num) || level !== 'full') {
      setDisplayValue(value);
      return;
    }

    const prefix = String(value).startsWith('₹') ? '₹' : '';
    const suffix = String(value).endsWith('%') ? '%' : '';

    const duration = 300;
    const startTime = performance.now();
    const startVal = num > 1000 ? num * 0.9 : 0;

    let animId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress);
      const currentVal = startVal + (num - startVal) * easedProgress;

      let formatted = '';
      if (Number.isInteger(num)) {
        formatted = Math.floor(currentVal).toLocaleString('en-IN');
      } else {
        formatted = currentVal.toFixed(1);
      }

      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, level]);

  return <>{displayValue}</>;
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedKpiValue value={value} />
      </div>
    </div>
  );
}

function StatusRow({ label, count, badgeClass }: { label: string; count: number; badgeClass: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0' }}>
      <span className={`status-badge ${badgeClass}`}>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{count}</span>
    </div>
  );
}
