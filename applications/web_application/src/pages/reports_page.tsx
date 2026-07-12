import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import apiClient from '../shared/api_client';

const CHART_COLORS = ['#B85C4F', '#4A6B8A', '#7A9270', '#C79A5B', '#8B76A8', '#A9A79E'];
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type ReportType = 'trip-summary' | 'expense-breakdown' | 'driver-performance' | 'maintenance-cost';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('trip-summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = (type: ReportType) => {
    setLoading(true);
    setActiveReport(type);
    apiClient.get(`/reports/${type}`).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport('trip-summary'); }, []);

  const downloadExport = (format: 'csv' | 'pdf') => {
    const token = localStorage.getItem('access_token');
    window.open(`${API_BASE}/reports/${activeReport}/${format}?token=${token}`, '_blank');
  };

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Reports</h2>
        <div className="topbar-actions">
          <button className="button button-secondary button-small" onClick={() => downloadExport('csv')}>📥 CSV</button>
          <button className="button button-secondary button-small" onClick={() => downloadExport('pdf')}>📄 PDF</button>
        </div>
      </div>
      <div className="page-content">
        <div className="filters-bar mb-6">
          {([
            ['trip-summary', 'Trip Summary'],
            ['expense-breakdown', 'Expense Breakdown'],
            ['driver-performance', 'Driver Performance'],
            ['maintenance-cost', 'Maintenance Cost'],
          ] as [ReportType, string][]).map(([key, label]) => (
            <button key={key} className={`button ${activeReport === key ? 'button-primary' : 'button-secondary'} button-small`}
              onClick={() => fetchReport(key)}>{label}</button>
          ))}
        </div>

        {loading && <p className="text-muted">Loading report...</p>}

        {!loading && data && activeReport === 'trip-summary' && <TripSummaryChart data={data} />}
        {!loading && data && activeReport === 'expense-breakdown' && <ExpenseBreakdownChart data={data} />}
        {!loading && data && activeReport === 'driver-performance' && <DriverPerformanceChart data={data} />}
        {!loading && data && activeReport === 'maintenance-cost' && <MaintenanceCostChart data={data} />}
      </div>
    </>
  );
}

function TripSummaryChart({ data }: { data: any }) {
  return (
    <>
      <div className="kpi-grid mb-6">
        <div className="kpi-card"><div className="kpi-card-label">Total Trips</div><div className="kpi-card-value">{data.grand_total_trips}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Revenue</div><div className="kpi-card-value">₹{data.grand_total_revenue?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Distance</div><div className="kpi-card-value">{data.grand_total_distance_km?.toLocaleString()} km</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Fuel Cost</div><div className="kpi-card-value">₹{data.grand_total_fuel_cost?.toLocaleString()}</div></div>
      </div>
      <div className="card">
        <h3 className="card-title mb-4">Revenue by Vehicle</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="vehicle_registration_number" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total_revenue" fill="#B85C4F" name="Revenue (₹)" radius={[4,4,0,0]} />
            <Bar dataKey="total_fuel_cost" fill="#4A6B8A" name="Fuel Cost (₹)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function ExpenseBreakdownChart({ data }: { data: any }) {
  return (
    <>
      <div className="kpi-grid mb-6">
        <div className="kpi-card"><div className="kpi-card-label">Grand Total</div><div className="kpi-card-value">₹{data.grand_total?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Categories</div><div className="kpi-card-value">{data.rows?.length}</div></div>
      </div>
      <div className="card">
        <h3 className="card-title mb-4">Expense Distribution</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie data={data.rows} dataKey="total_amount" nameKey="expense_type" cx="50%" cy="50%" outerRadius={130} label={(entry: any) => `${entry.expense_type}: ₹${entry.total_amount?.toLocaleString()}`}>
              {data.rows?.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function DriverPerformanceChart({ data }: { data: any }) {
  return (
    <>
      <div className="kpi-grid mb-6">
        <div className="kpi-card"><div className="kpi-card-label">Total Drivers</div><div className="kpi-card-value">{data.total_drivers}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Avg Safety Score</div><div className="kpi-card-value">{data.average_safety_score}</div></div>
      </div>
      <div className="card">
        <h3 className="card-title mb-4">Safety Score by Driver</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.rows} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="driver_name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="safety_score" name="Safety Score" radius={[0,4,4,0]}>
              {data.rows?.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.safety_score >= 80 ? '#7A9270' : entry.safety_score >= 50 ? '#C79A5B' : '#B85C4F'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function MaintenanceCostChart({ data }: { data: any }) {
  return (
    <>
      <div className="kpi-grid mb-6">
        <div className="kpi-card"><div className="kpi-card-label">Total Cost</div><div className="kpi-card-value">₹{data.grand_total_cost?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Records</div><div className="kpi-card-value">{data.total_records}</div></div>
      </div>
      <div className="card">
        <h3 className="card-title mb-4">Maintenance Cost by Vehicle</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data.rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="vehicle_registration_number" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="total_maintenance_cost" fill="#C79A5B" name="Cost (₹)" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
