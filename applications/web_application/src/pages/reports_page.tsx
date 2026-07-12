import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import apiClient from '../shared/api_client';
import { getResolvedMotionLevel } from '../animation/reducedMotion';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  ChartLegend
);

const CHART_COLORS = ['#B85C4F', '#4A6B8A', '#7A9270', '#C79A5B', '#8B76A8', '#A9A79E'];
type ReportType = 'trip-summary' | 'expense-breakdown' | 'driver-performance' | 'maintenance-cost' | 'vehicle-profitability';
interface VehicleOption { id:number; registration_number:string; name_model:string; region:string|null; }

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('trip-summary');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [filters, setFilters] = useState({start_date:'',end_date:'',vehicle_id:'',region:''});

  const fetchReport = (type: ReportType) => {
    setLoading(true);
    setActiveReport(type);
    apiClient.get(`/reports/${type}`, { params:Object.fromEntries(Object.entries(filters).filter(([,value])=>value)) })
      .then(r => setData(r.data))
      .catch(error => setFeedbackMessage(getApiErrorMessage(error, 'The report could not be loaded.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    apiClient.get('/reports/trip-summary')
      .then(response=>setData(response.data))
      .catch(error=>setFeedbackMessage(getApiErrorMessage(error,'The report could not be loaded.')))
      .finally(()=>setLoading(false));
    Promise.all([apiClient.get('/vehicles'),apiClient.get('/vehicles/regions')]).then(([v,r])=>{setVehicles(v.data);setRegions(r.data);}).catch(()=>undefined);
  }, []);

  const downloadExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await apiClient.get(`/reports/${activeReport}/${format}`, { responseType: 'blob', params:Object.fromEntries(Object.entries(filters).filter(([,value])=>value)) });
      const downloadUrl = URL.createObjectURL(response.data);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = `${activeReport}.${format}`;
      downloadLink.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'The report export could not be downloaded.')); }
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
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
        <div className="card mb-6"><div className="form-row"><div className="form-group"><label className="form-label">From</label><input className="form-input" type="date" value={filters.start_date} onChange={e=>setFilters({...filters,start_date:e.target.value})}/></div><div className="form-group"><label className="form-label">To</label><input className="form-input" type="date" value={filters.end_date} onChange={e=>setFilters({...filters,end_date:e.target.value})}/></div><div className="form-group"><label className="form-label">Vehicle</label><select className="form-select" value={filters.vehicle_id} onChange={e=>setFilters({...filters,vehicle_id:e.target.value})}><option value="">All vehicles</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.registration_number} — {v.name_model}</option>)}</select></div><div className="form-group"><label className="form-label">Region</label><select className="form-select" value={filters.region} onChange={e=>setFilters({...filters,region:e.target.value})}><option value="">All regions</option>{regions.map(region=><option key={region} value={region}>{region}</option>)}</select></div><div className="form-group" style={{justifyContent:'flex-end'}}><button className="button button-primary" onClick={()=>fetchReport(activeReport)}>Apply Filters</button></div></div></div>
        <div className="filters-bar mb-6" style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {([
            ['trip-summary', 'Trip Summary'],
            ['expense-breakdown', 'Expense Breakdown'],
            ['driver-performance', 'Driver Performance'],
            ['maintenance-cost', 'Maintenance Cost'],
            ['vehicle-profitability', 'Profitability & ROI'],
          ] as [ReportType, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`button ${activeReport === key ? 'button-primary' : 'button-secondary'} button-small`}
              onClick={() => fetchReport(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-muted">Loading report...</p>}

        {!loading && data && activeReport === 'trip-summary' && <TripSummaryChart data={data} />}
        {!loading && data && activeReport === 'expense-breakdown' && <ExpenseBreakdownChart data={data} />}
        {!loading && data && activeReport === 'driver-performance' && <DriverPerformanceChart data={data} />}
        {!loading && data && activeReport === 'maintenance-cost' && <MaintenanceCostChart data={data} />}
        {!loading && data && activeReport === 'vehicle-profitability' && <ProfitabilityChart data={data} />}
      </div>
    </>
  );
}

function getCommonOptions() {
  const isReduced = getResolvedMotionLevel() !== 'full';
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: isReduced ? false as const : {
      duration: 480,
      easing: 'easeOutQuart' as const
    },
    plugins: {
      legend: {
        labels: {
          font: {
            family: 'Inter',
            size: 11
          }
        }
      }
    }
  };
}

function TripSummaryChart({ data }: { data: any }) {
  const chartData = {
    labels: data.rows?.map((r: any) => r.vehicle_registration_number) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.rows?.map((r: any) => r.total_revenue) || [],
        backgroundColor: '#B85C4F',
        borderRadius: 4,
      },
      {
        label: 'Fuel Cost (₹)',
        data: data.rows?.map((r: any) => r.total_fuel_cost) || [],
        backgroundColor: '#4A6B8A',
        borderRadius: 4,
      }
    ]
  };

  const options = getCommonOptions();

  return (
    <>
      <div className="kpi-grid mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-card-label">Total Trips</div><div className="kpi-card-value">{data.grand_total_trips}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Revenue</div><div className="kpi-card-value">₹{data.grand_total_revenue?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Distance</div><div className="kpi-card-value">{data.grand_total_distance_km?.toLocaleString()} km</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Fuel Cost</div><div className="kpi-card-value">₹{data.grand_total_fuel_cost?.toLocaleString()}</div></div>
      </div>
      <div className="card" style={{ height: '400px' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Revenue by Vehicle</h3>
        <div style={{ height: '320px', position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}

function ExpenseBreakdownChart({ data }: { data: any }) {
  const chartData = {
    labels: data.rows?.map((r: any) => r.expense_type) || [],
    datasets: [
      {
        label: 'Expense Amount',
        data: data.rows?.map((r: any) => r.total_amount) || [],
        backgroundColor: CHART_COLORS,
        borderWidth: 1,
      }
    ]
  };

  const options = getCommonOptions();

  return (
    <>
      <div className="kpi-grid mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-card-label">Grand Total</div><div className="kpi-card-value">₹{data.grand_total?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Categories</div><div className="kpi-card-value">{data.rows?.length}</div></div>
      </div>
      <div className="card" style={{ height: '400px' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Expense Distribution</h3>
        <div style={{ height: '320px', position: 'relative' }}>
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}

function DriverPerformanceChart({ data }: { data: any }) {
  const chartData = {
    labels: data.rows?.map((r: any) => r.driver_name) || [],
    datasets: [
      {
        label: 'Safety Score',
        data: data.rows?.map((r: any) => r.safety_score) || [],
        backgroundColor: data.rows?.map((r: any) =>
          r.safety_score >= 80 ? '#7A9270' : r.safety_score >= 50 ? '#C79A5B' : '#B85C4F'
        ),
        borderRadius: 4,
      }
    ]
  };

  const options = {
    ...getCommonOptions(),
    indexAxis: 'y' as const,
    scales: {
      x: {
        min: 0,
        max: 100
      }
    }
  };

  return (
    <>
      <div className="kpi-grid mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-card-label">Total Drivers</div><div className="kpi-card-value">{data.total_drivers}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Avg Safety Score</div><div className="kpi-card-value">{data.average_safety_score}</div></div>
      </div>
      <div className="card" style={{ height: '400px' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Safety Score by Driver</h3>
        <div style={{ height: '320px', position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}

function MaintenanceCostChart({ data }: { data: any }) {
  const chartData = {
    labels: data.rows?.map((r: any) => r.vehicle_registration_number) || [],
    datasets: [
      {
        label: 'Cost (₹)',
        data: data.rows?.map((r: any) => r.total_maintenance_cost) || [],
        backgroundColor: '#C79A5B',
        borderRadius: 4,
      }
    ]
  };

  const options = getCommonOptions();

  return (
    <>
      <div className="kpi-grid mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-card-label">Total Cost</div><div className="kpi-card-value">₹{data.grand_total_cost?.toLocaleString()}</div></div>
        <div className="kpi-card"><div className="kpi-card-label">Total Records</div><div className="kpi-card-value">{data.total_records}</div></div>
      </div>
      <div className="card" style={{ height: '400px' }}>
        <h3 className="card-title" style={{ marginBottom: 'var(--space-4)' }}>Maintenance Cost by Vehicle</h3>
        <div style={{ height: '320px', position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </>
  );
}

function ProfitabilityChart({ data }: { data:any }) {
  const chartData={labels:data.rows?.map((row:any)=>row.vehicle_registration_number)||[],datasets:[{label:'Revenue (₹)',data:data.rows?.map((row:any)=>row.revenue)||[],backgroundColor:'#7A9270',borderRadius:4},{label:'Operational Cost (₹)',data:data.rows?.map((row:any)=>row.total_operational_cost)||[],backgroundColor:'#C79A5B',borderRadius:4},{label:'Net Profit (₹)',data:data.rows?.map((row:any)=>row.net_profit)||[],backgroundColor:'#4A6B8A',borderRadius:4}]};
  return <><div className="kpi-grid mb-6"><div className="kpi-card"><div className="kpi-card-label">Revenue</div><div className="kpi-card-value">₹{data.total_revenue?.toLocaleString('en-IN')}</div></div><div className="kpi-card"><div className="kpi-card-label">Operational Cost</div><div className="kpi-card-value">₹{data.total_operational_cost?.toLocaleString('en-IN')}</div></div><div className="kpi-card"><div className="kpi-card-label">Net Profit</div><div className="kpi-card-value">₹{data.total_net_profit?.toLocaleString('en-IN')}</div></div></div><div className="card" style={{height:420}}><h3 className="card-title mb-4">Vehicle Profitability and ROI</h3><div style={{height:330}}><Bar data={chartData} options={getCommonOptions()}/></div></div><div className="card mt-6"><div className="data-table-container"><table className="data-table"><thead><tr><th>Vehicle</th><th>Revenue</th><th>Fuel</th><th>Maintenance</th><th>Other</th><th>Net Profit</th><th>ROI</th></tr></thead><tbody>{data.rows?.map((row:any)=><tr key={row.vehicle_id}><td>{row.vehicle_registration_number}</td><td>₹{row.revenue.toLocaleString('en-IN')}</td><td>₹{row.fuel_cost.toLocaleString('en-IN')}</td><td>₹{row.maintenance_cost.toLocaleString('en-IN')}</td><td>₹{row.other_expenses.toLocaleString('en-IN')}</td><td>₹{row.net_profit.toLocaleString('en-IN')}</td><td>{row.roi_percent}%</td></tr>)}</tbody></table></div></div></>;
}
