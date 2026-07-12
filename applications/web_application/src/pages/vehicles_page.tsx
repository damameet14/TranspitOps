import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';

interface Vehicle {
  id: number; registration_number: string; name_model: string; type: string;
  max_load_capacity_kg: number; odometer_km: number; acquisition_cost: number;
  status: string; region: string | null; created_at: string;
}

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ registration_number: '', name_model: '', type: 'truck', max_load_capacity_kg: '', odometer_km: '0', acquisition_cost: '0', region: '' });
  const canWrite = user?.role === 'fleet_manager';

  const fetchVehicles = () => {
    apiClient.get('/vehicles').then(r => setVehicles(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetchVehicles, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post('/vehicles', { ...form, max_load_capacity_kg: +form.max_load_capacity_kg, odometer_km: +form.odometer_km, acquisition_cost: +form.acquisition_cost, region: form.region || null });
    setShowForm(false);
    setForm({ registration_number: '', name_model: '', type: 'truck', max_load_capacity_kg: '', odometer_km: '0', acquisition_cost: '0', region: '' });
    fetchVehicles();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this vehicle?')) return;
    await apiClient.delete(`/vehicles/${id}`);
    fetchVehicles();
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Vehicles</h2>
        <div className="topbar-actions">
          {canWrite && <button className="button button-primary" onClick={() => setShowForm(!showForm)}>+ Add Vehicle</button>}
        </div>
      </div>
      <div className="page-content">
        {showForm && (
          <div className="card mb-6">
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Registration No.</label><input className="form-input" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Model Name</label><input className="form-input" value={form.name_model} onChange={e => setForm({...form, name_model: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="truck">Truck</option><option value="van">Van</option><option value="bike">Bike</option><option value="other">Other</option></select></div>
                <div className="form-group"><label className="form-label">Max Load (kg)</label><input className="form-input" type="number" value={form.max_load_capacity_kg} onChange={e => setForm({...form, max_load_capacity_kg: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Region</label><input className="form-input" value={form.region} onChange={e => setForm({...form, region: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Acquisition Cost (₹)</label><input className="form-input" type="number" value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} /></div>
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
              <thead><tr><th>Registration</th><th>Model</th><th>Type</th><th>Capacity (kg)</th><th>Odometer (km)</th><th>Region</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{fontWeight:500}}>{v.registration_number}</td>
                    <td>{v.name_model}</td>
                    <td>{v.type}</td>
                    <td>{v.max_load_capacity_kg.toLocaleString()}</td>
                    <td>{v.odometer_km.toLocaleString()}</td>
                    <td>{v.region || '—'}</td>
                    <td><span className={`status-badge status-badge-${v.status}`}>{v.status.replace('_',' ')}</span></td>
                    {canWrite && <td><button className="button button-small button-danger" onClick={()=>handleDelete(v.id)}>Delete</button></td>}
                  </tr>
                ))}
                {vehicles.length === 0 && <tr><td colSpan={8} className="data-table-empty">No vehicles found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
