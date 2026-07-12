import { useEffect, useMemo, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

interface FuelLog { id:number; vehicle_id:number; trip_id:number|null; liters:number; cost:number; log_date:string; vehicle_registration_number:string|null; vehicle_name_model:string|null; }
interface VehicleOption { id:number; registration_number:string; name_model:string; }
const today = () => new Date().toISOString().slice(0, 10);

export default function FuelLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [form, setForm] = useState({ vehicle_id:'', trip_id:'', liters:'', cost:'', log_date:today() });
  const canWrite = user?.role === 'fleet_manager' || user?.role === 'financial_analyst';

  const load = () => Promise.all([apiClient.get('/fuel-logs'), apiClient.get('/vehicles')])
    .then(([logsResponse, vehiclesResponse]) => { setLogs(logsResponse.data); setVehicles(vehiclesResponse.data); })
    .catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Fuel data could not be loaded.')))
    .finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);

  const filteredLogs = useMemo(() => logs.filter(log => `${log.vehicle_registration_number ?? ''} ${log.vehicle_name_model ?? ''} ${log.trip_id ?? ''} ${log.log_date}`.toLowerCase().includes(search.toLowerCase())), [logs, search]);
  const submit = async (event:React.FormEvent) => {
    event.preventDefault();
    try {
      await apiClient.post('/fuel-logs', { vehicle_id:+form.vehicle_id, trip_id:form.trip_id ? +form.trip_id : null, liters:+form.liters, cost:+form.cost, log_date:form.log_date });
      setForm({vehicle_id:'',trip_id:'',liters:'',cost:'',log_date:today()}); setShowForm(false); setFeedbackMessage('Fuel log created successfully.'); await load();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Fuel log could not be created.')); }
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;
  return <><div className="topbar"><h2 className="topbar-title">Fuel Logs</h2>{canWrite && <button className="button button-primary" onClick={()=>setShowForm(value=>!value)}>+ Add Fuel Log</button>}</div><div className="page-content">
    <FeedbackCard message={feedbackMessage} onDismiss={()=>setFeedbackMessage('')} />
    {showForm && <div className="card mb-6"><h3 className="card-title mb-4">New Fuel Log</h3><form onSubmit={submit}><div className="form-row"><div className="form-group"><label className="form-label">Vehicle</label><select className="form-select" required value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})}><option value="">Select vehicle...</option>{vehicles.map(vehicle=><option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number} — {vehicle.name_model}</option>)}</select></div><div className="form-group"><label className="form-label">Trip ID (optional)</label><input className="form-input" type="number" min="1" value={form.trip_id} onChange={e=>setForm({...form,trip_id:e.target.value})}/></div></div><div className="form-row"><div className="form-group"><label className="form-label">Liters</label><input className="form-input" type="number" min="0.01" step="0.01" required value={form.liters} onChange={e=>setForm({...form,liters:e.target.value})}/></div><div className="form-group"><label className="form-label">Invoice Cost (₹)</label><input className="form-input" type="number" min="0.01" step="0.01" required value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})}/></div><div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" required value={form.log_date} onChange={e=>setForm({...form,log_date:e.target.value})}/></div></div><button className="button button-primary" type="submit">Save Fuel Log</button> <button className="button button-secondary" type="button" onClick={()=>setShowForm(false)}>Cancel</button></form></div>}
    <div className="card"><div className="card-header"><input className="form-input" style={{maxWidth:360}} placeholder="Search vehicle, trip or date..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="data-table-container"><table className="data-table"><thead><tr><th>Date</th><th>Vehicle</th><th>Trip</th><th>Liters</th><th>Cost (₹)</th></tr></thead><tbody>{filteredLogs.map(log=><tr key={log.id}><td>{log.log_date}</td><td>{log.vehicle_registration_number || `#${log.vehicle_id}`}</td><td>{log.trip_id ? `#${log.trip_id}` : '—'}</td><td>{log.liters}</td><td>₹{log.cost.toLocaleString('en-IN')}</td></tr>)}{filteredLogs.length===0&&<tr><td colSpan={5} className="data-table-empty">No fuel logs found</td></tr>}</tbody></table></div></div>
  </div></>;
}
