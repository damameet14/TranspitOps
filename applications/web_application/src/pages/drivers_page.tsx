import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';

interface Driver {
  id: number; name: string; license_number: string; license_category: string;
  license_expiry_date: string; contact_number: string; safety_score: number;
  status: string; is_license_expired: boolean;
}

export default function DriversPage() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', license_number: '', license_category: 'LMV-TR', license_expiry_date: '', contact_number: '', safety_score: '100' });
  const canWrite = user?.role === 'fleet_manager' || user?.role === 'safety_officer';

  const fetchDrivers = () => { apiClient.get('/drivers').then(r => setDrivers(r.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(fetchDrivers, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post('/drivers', { ...form, safety_score: +form.safety_score });
    setShowForm(false);
    setForm({ name: '', license_number: '', license_category: 'LMV-TR', license_expiry_date: '', contact_number: '', safety_score: '100' });
    fetchDrivers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this driver?')) return;
    await apiClient.delete(`/drivers/${id}`);
    fetchDrivers();
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Drivers</h2>
        <div className="topbar-actions">
          {canWrite && <button className="button button-primary" onClick={() => setShowForm(!showForm)}>+ Add Driver</button>}
        </div>
      </div>
      <div className="page-content">
        {showForm && (
          <div className="card mb-6">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">License Number</label><input className="form-input" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">License Category</label><input className="form-input" value={form.license_category} onChange={e => setForm({...form, license_category: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">License Expiry</label><input className="form-input" type="date" value={form.license_expiry_date} onChange={e => setForm({...form, license_expiry_date: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input" value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Safety Score (0-100)</label><input className="form-input" type="number" min="0" max="100" value={form.safety_score} onChange={e => setForm({...form, safety_score: e.target.value})} /></div>
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
                <button type="submit" className="button button-primary">Create</button>
                <button type="button" className="button button-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>License No.</th><th>Category</th><th>Expiry</th><th>Contact</th><th>Safety</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d.id} className={d.is_license_expired ? 'row-overdue' : ''}>
                    <td style={{fontWeight:500}}>{d.name}</td>
                    <td>{d.license_number}</td>
                    <td>{d.license_category}</td>
                    <td>{d.license_expiry_date}{d.is_license_expired && <span style={{color:'var(--feedback-danger-text)',marginLeft:'var(--space-2)',fontSize:'var(--font-size-caption)'}}>EXPIRED</span>}</td>
                    <td>{d.contact_number}</td>
                    <td><span style={{fontWeight:500,color:d.safety_score >= 80 ? 'var(--state-available-text)' : d.safety_score >= 50 ? 'var(--state-in-shop-text)' : 'var(--state-suspended-text)'}}>{d.safety_score}</span></td>
                    <td><span className={`status-badge status-badge-${d.status}`}>{d.status.replace('_',' ')}</span></td>
                    {canWrite && <td><button className="button button-small button-danger" onClick={()=>handleDelete(d.id)}>Delete</button></td>}
                  </tr>
                ))}
                {drivers.length === 0 && <tr><td colSpan={8} className="data-table-empty">No drivers found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
