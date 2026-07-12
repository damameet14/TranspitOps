import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { getResolvedMotionLevel } from '../animation/reducedMotion';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

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
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    apiClient.get('/dashboard/kpis')
      .then((res) => setKpis(res.data))
      .catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Dashboard metrics could not be loaded.')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><p className="text-muted">Loading dashboard...</p></div>;
  if (!kpis) return <div className="page-content"><FeedbackCard message={feedbackMessage || 'Dashboard metrics could not be loaded.'} /></div>;

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
