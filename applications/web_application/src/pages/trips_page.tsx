import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';

interface Trip {
  id: number; source: string; destination: string; vehicle_id: number; driver_id: number;
  cargo_weight_kg: number; planned_distance_km: number; actual_distance_km: number | null;
  revenue: number; status: string; fuel_consumed_liters: number | null;
  dispatched_at: string | null; completed_at: string | null; created_at: string;
  vehicle_registration_number: string | null; vehicle_name_model: string | null; driver_name: string | null;
}

interface VehicleOption { id: number; registration_number: string; name_model: string; max_load_capacity_kg: number; }
interface DriverOption { id: number; name: string; license_number: string; }
interface RouteSuggestion { suggested_distance_km: number; suggested_duration_minutes: number; }

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [routeSuggestion, setRouteSuggestion] = useState<RouteSuggestion | null>(null);
  const [completeTrip, setCompleteTrip] = useState<{id: number; form: {final_odometer_km: string; fuel_consumed_liters: string; actual_distance_km: string}} | null>(null);
  const [form, setForm] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight_kg: '', planned_distance_km: '', revenue: '' });
  const canWrite = user?.role === 'fleet_manager' || user?.role === 'driver';

  const fetchTrips = () => { apiClient.get('/trips').then(r => setTrips(r.data)).catch(console.error).finally(() => setLoading(false)); };
  useEffect(fetchTrips, []);

  const openForm = async () => {
    const [v, d] = await Promise.all([apiClient.get('/vehicles/available'), apiClient.get('/drivers/available')]);
    setVehicles(v.data); setDrivers(d.data);
    setShowForm(true);
  };

  const handleSuggestRoute = async () => {
    if (!form.source || !form.destination) return;
    try {
      const r = await apiClient.post('/routes/suggest', { source: form.source, destination: form.destination });
      setRouteSuggestion(r.data);
      setForm(f => ({ ...f, planned_distance_km: String(r.data.suggested_distance_km) }));
    } catch { setRouteSuggestion(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiClient.post('/trips', { ...form, vehicle_id: +form.vehicle_id, driver_id: +form.driver_id, cargo_weight_kg: +form.cargo_weight_kg, planned_distance_km: +form.planned_distance_km, revenue: +form.revenue });
    setShowForm(false); setRouteSuggestion(null);
    setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight_kg: '', planned_distance_km: '', revenue: '' });
    fetchTrips();
  };

  const handleDispatch = async (id: number) => { await apiClient.post(`/trips/${id}/dispatch`); fetchTrips(); };
  const handleCancel = async (id: number) => { if(confirm('Cancel this trip?')) { await apiClient.post(`/trips/${id}/cancel`); fetchTrips(); }};

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTrip) return;
    await apiClient.post(`/trips/${completeTrip.id}/complete`, {
      final_odometer_km: +completeTrip.form.final_odometer_km,
      fuel_consumed_liters: +completeTrip.form.fuel_consumed_liters,
      actual_distance_km: +completeTrip.form.actual_distance_km,
    });
    setCompleteTrip(null); fetchTrips();
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Trips</h2>
        <div className="topbar-actions">
          {canWrite && <button className="button button-primary" onClick={openForm}>+ Create Trip</button>}
        </div>
      </div>
      <div className="page-content">
        {showForm && (
          <div className="card mb-6">
            <h3 className="card-title mb-4">New Trip</h3>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Source</label><input className="form-input" value={form.source} onChange={e => setForm({...form, source: e.target.value})} placeholder="e.g. Ahmedabad" required /></div>
                <div className="form-group"><label className="form-label">Destination</label><input className="form-input" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} placeholder="e.g. Vadodara" required /></div>
              </div>
              {form.source && form.destination && (
                <div style={{marginBottom:'var(--space-4)'}}>
                  <button type="button" className="button button-secondary button-small" onClick={handleSuggestRoute}>🗺️ Suggest Route</button>
                  {routeSuggestion && <span className="text-muted" style={{marginLeft:'var(--space-3)',fontSize:'var(--font-size-small)'}}>
                    {routeSuggestion.suggested_distance_km} km · ~{routeSuggestion.suggested_duration_minutes} min
                  </span>}
                </div>
              )}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Vehicle</label>
                  <select className="form-select" value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} required>
                    <option value="">Select vehicle...</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} — {v.name_model} ({v.max_load_capacity_kg} kg)</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Driver</label>
                  <select className="form-select" value={form.driver_id} onChange={e => setForm({...form, driver_id: e.target.value})} required>
                    <option value="">Select driver...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.license_number})</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Cargo Weight (kg)</label><input className="form-input" type="number" value={form.cargo_weight_kg} onChange={e => setForm({...form, cargo_weight_kg: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Planned Distance (km)</label><input className="form-input" type="number" value={form.planned_distance_km} onChange={e => setForm({...form, planned_distance_km: e.target.value})} required /></div>
              </div>
              <div className="form-group" style={{maxWidth:'calc(50% - var(--space-2))'}}>
                <label className="form-label">Revenue (₹)</label><input className="form-input" type="number" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} required />
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
                <button type="submit" className="button button-primary">Create as Draft</button>
                <button type="button" className="button button-secondary" onClick={()=>{setShowForm(false);setRouteSuggestion(null);}}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {completeTrip && (
          <div className="modal-overlay" onClick={()=>setCompleteTrip(null)}>
            <div className="modal-container" onClick={e=>e.stopPropagation()}>
              <div className="modal-header"><h3 className="modal-title">Complete Trip #{completeTrip.id}</h3><button className="modal-close-button" onClick={()=>setCompleteTrip(null)}>✕</button></div>
              <form onSubmit={handleComplete}>
                <div className="modal-body">
                  <div className="form-group"><label className="form-label">Final Odometer (km)</label><input className="form-input" type="number" value={completeTrip.form.final_odometer_km} onChange={e=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,final_odometer_km:e.target.value}})} required /></div>
                  <div className="form-group"><label className="form-label">Fuel Consumed (liters)</label><input className="form-input" type="number" step="0.1" value={completeTrip.form.fuel_consumed_liters} onChange={e=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,fuel_consumed_liters:e.target.value}})} required /></div>
                  <div className="form-group"><label className="form-label">Actual Distance (km)</label><input className="form-input" type="number" value={completeTrip.form.actual_distance_km} onChange={e=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,actual_distance_km:e.target.value}})} required /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="button button-secondary" onClick={()=>setCompleteTrip(null)}>Cancel</button>
                  <button type="submit" className="button button-primary">Complete Trip</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo (kg)</th><th>Revenue</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td>{t.source} → {t.destination}</td>
                    <td>{t.vehicle_registration_number || `#${t.vehicle_id}`}</td>
                    <td>{t.driver_name || `#${t.driver_id}`}</td>
                    <td>{t.cargo_weight_kg}</td>
                    <td>₹{t.revenue.toLocaleString()}</td>
                    <td><span className={`status-badge status-badge-${t.status}`}>{t.status}</span></td>
                    {canWrite && <td className="data-table-actions">
                      {t.status === 'draft' && <button className="button button-small button-primary" onClick={()=>handleDispatch(t.id)}>Dispatch</button>}
                      {t.status === 'dispatched' && <button className="button button-small button-primary" onClick={()=>setCompleteTrip({id:t.id,form:{final_odometer_km:'',fuel_consumed_liters:'',actual_distance_km:''}})}>Complete</button>}
                      {(t.status === 'draft' || t.status === 'dispatched') && <button className="button button-small button-danger" onClick={()=>handleCancel(t.id)}>Cancel</button>}
                    </td>}
                  </tr>
                ))}
                {trips.length === 0 && <tr><td colSpan={8} className="data-table-empty">No trips found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
