import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';

interface FuelLog {
  id: number; vehicle_id: number; trip_id: number | null; liters: number; cost: number;
  log_date: string; vehicle_registration_number: string | null; vehicle_name_model: string | null;
}

export default function FuelLogsPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/fuel-logs').then(r => setLogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar"><h2 className="topbar-title">Fuel Logs</h2></div>
      <div className="page-content">
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Vehicle</th><th>Trip</th><th>Liters</th><th>Cost (₹)</th></tr></thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{l.log_date}</td>
                    <td>{l.vehicle_registration_number || `#${l.vehicle_id}`}</td>
                    <td>{l.trip_id ? `#${l.trip_id}` : '—'}</td>
                    <td>{l.liters}</td>
                    <td>₹{l.cost.toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={5} className="data-table-empty">No fuel logs found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
