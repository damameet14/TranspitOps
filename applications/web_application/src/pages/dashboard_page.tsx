import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';

interface DashboardKpis {
  total_vehicles: number;
  total_drivers: number;
  total_trips: number;
  active_trips: number;
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
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/dashboard/kpis')
      .then((res) => setKpis(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><p className="text-muted">Loading dashboard...</p></div>;
  if (!kpis) return <div className="page-content"><p className="text-muted">Failed to load KPIs.</p></div>;

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Dashboard</h2>
      </div>
      <div className="page-content">
        {/* KPI Cards */}
        <div className="kpi-grid">
          <KpiCard label="Total Vehicles" value={kpis.total_vehicles} />
          <KpiCard label="Total Drivers" value={kpis.total_drivers} />
          <KpiCard label="Active Trips" value={kpis.active_trips} />
          <KpiCard label="Completed Trips" value={kpis.completed_trips} />
          <KpiCard label="Fleet Utilization" value={`${kpis.fleet_utilization_percent}%`} />
          <KpiCard label="Avg Safety Score" value={kpis.average_safety_score} />
          <KpiCard label="Total Revenue" value={formatCurrency(kpis.total_revenue)} />
          <KpiCard label="Total Fuel Cost" value={formatCurrency(kpis.total_fuel_cost)} />
          <KpiCard label="Total Expenses" value={formatCurrency(kpis.total_expenses)} />
          <KpiCard label="Maintenance Cost" value={formatCurrency(kpis.total_maintenance_cost)} />
        </div>

        {/* Status Breakdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
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
        </div>
      </div>
    </>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
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
