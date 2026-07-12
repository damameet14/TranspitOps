import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

interface MaintenanceRecord {
  id: number; vehicle_id: number; type: string; cost: number; description: string | null;
  status: string; created_at: string; closed_at: string | null;
  vehicle_registration_number: string | null; vehicle_name_model: string | null;
}

export default function MaintenancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [form, setForm] = useState({ vehicle_id: '', type: '', cost: '', description: '' });
  const [vehicles, setVehicles] = useState<{id:number;registration_number:string;name_model:string}[]>([]);
  const canWrite = user?.role === 'fleet_manager';

  const fetchRecords = () => { apiClient.get('/maintenance').then(r => setRecords(r.data)).catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Maintenance records could not be loaded.'))).finally(() => setLoading(false)); };
  useEffect(fetchRecords, []);

  const openForm = async () => {
    try { const v = await apiClient.get('/vehicles'); setVehicles(v.data); setShowForm(true); }
    catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Vehicles could not be loaded.')); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/maintenance', { vehicle_id: +form.vehicle_id, type: form.type, cost: +form.cost, description: form.description || null });
      setShowForm(false); setForm({ vehicle_id: '', type: '', cost: '', description: '' }); fetchRecords();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Maintenance record could not be created.')); }
  };

  const handleClose = async (id: number) => {
    try { await apiClient.post(`/maintenance/${id}/close`); fetchRecords(); }
    catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Maintenance record could not be closed.')); }
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar"><h2 className="topbar-title">Maintenance</h2>
        <div className="topbar-actions">{canWrite && <button className="button button-primary" onClick={openForm}>+ New Record</button>}</div>
      </div>
      <div className="page-content">
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
        {showForm && (
          <div className="card mb-6">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Vehicle</label>
                  <select className="form-select" value={form.vehicle_id} onChange={e=>setForm({...form,vehicle_id:e.target.value})} required>
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v=><option key={v.id} value={v.id}>{v.registration_number} — {v.name_model}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Type</label><input className="form-input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})} placeholder="e.g. brake_service" required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Cost (₹)</label><input className="form-input" type="number" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
                <button type="submit" className="button button-primary">Create (sends vehicle to shop)</button>
                <button type="button" className="button button-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Vehicle</th><th>Type</th><th>Cost (₹)</th><th>Description</th><th>Status</th><th>Created</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.vehicle_registration_number || `#${r.vehicle_id}`}</td>
                    <td>{r.type}</td>
                    <td>₹{r.cost.toLocaleString()}</td>
                    <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.description || '—'}</td>
                    <td><span className={`status-badge status-badge-${r.status}`}>{r.status}</span></td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    {canWrite && <td>{r.status === 'active' && <button className="button button-small button-primary" onClick={()=>handleClose(r.id)}>Close</button>}</td>}
                  </tr>
                ))}
                {records.length === 0 && <tr><td colSpan={8} className="data-table-empty">No records found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
