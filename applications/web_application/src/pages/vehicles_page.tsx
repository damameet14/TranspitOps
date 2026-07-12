import { useEffect, useMemo, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';
import ConfirmationDialog from '../shared/confirmation_dialog';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

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
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [vehiclePendingDeletion, setVehiclePendingDeletion] = useState<Vehicle | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ registration_number: '', name_model: '', type: 'truck', max_load_capacity_kg: '', odometer_km: '0', acquisition_cost: '0', region: '', status:'available' });
  const canWrite = user?.role === 'fleet_manager';

  const fetchVehicles = () => {
    apiClient.get('/vehicles').then(r => setVehicles(r.data)).catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Vehicles could not be loaded.'))).finally(() => setLoading(false));
  };
  useEffect(fetchVehicles, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vehiclePayload = { ...form, max_load_capacity_kg: +form.max_load_capacity_kg, odometer_km: +form.odometer_km, acquisition_cost: +form.acquisition_cost, region: form.region || null };
      if (editingVehicleId === null) await apiClient.post('/vehicles', vehiclePayload);
      else await apiClient.put(`/vehicles/${editingVehicleId}`, vehiclePayload);
      setShowForm(false);
      setEditingVehicleId(null);
      setForm({ registration_number: '', name_model: '', type: 'truck', max_load_capacity_kg: '', odometer_km: '0', acquisition_cost: '0', region: '', status:'available' });
      fetchVehicles();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, editingVehicleId === null ? 'Vehicle could not be created.' : 'Vehicle could not be updated.')); }
  };

  const openCreateForm = () => {
    setEditingVehicleId(null);
    setForm({ registration_number: '', name_model: '', type: 'truck', max_load_capacity_kg: '', odometer_km: '0', acquisition_cost: '0', region: '', status:'available' });
    setShowForm(true);
  };

  const openEditForm = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setForm({ registration_number: vehicle.registration_number, name_model: vehicle.name_model, type: vehicle.type, max_load_capacity_kg: String(vehicle.max_load_capacity_kg), odometer_km: String(vehicle.odometer_km), acquisition_cost: String(vehicle.acquisition_cost), region: vehicle.region ?? '', status:vehicle.status });
    setShowForm(true);
  };
  const filteredVehicles = useMemo(()=>vehicles.filter(vehicle=>`${vehicle.registration_number} ${vehicle.name_model} ${vehicle.type} ${vehicle.region??''} ${vehicle.status}`.toLowerCase().includes(search.toLowerCase())),[vehicles,search]);

  const handleDelete = async () => {
    if (!vehiclePendingDeletion) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/vehicles/${vehiclePendingDeletion.id}`);
      setVehiclePendingDeletion(null);
      fetchVehicles();
    } catch (error) {
      setFeedbackMessage(getApiErrorMessage(error, 'Vehicle could not be deleted.'));
      setVehiclePendingDeletion(null);
    } finally { setIsDeleting(false); }
  };

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Vehicles</h2>
        <div className="topbar-actions">
          {canWrite && <button className="button button-primary" onClick={openCreateForm}>+ Add Vehicle</button>}
        </div>
      </div>
      <div className="page-content">
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
        {showForm && (
          <div className="card mb-6">
            <h3 className="card-title mb-4">{editingVehicleId === null ? 'New Vehicle' : 'Edit Vehicle'}</h3>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Registration No.</label><input className="form-input" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Model Name</label><input className="form-input" value={form.name_model} onChange={e => setForm({...form, name_model: e.target.value})} required /></div>
              </div>
              {editingVehicleId !== null && <div className="form-row"><div className="form-group"><label className="form-label">Operational Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} disabled={form.status==='on_trip'||form.status==='in_shop'}><option value="available">Available</option><option value="retired">Retired</option>{form.status==='on_trip'&&<option value="on_trip">On trip (workflow controlled)</option>}{form.status==='in_shop'&&<option value="in_shop">In shop (workflow controlled)</option>}</select></div></div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="truck">Truck</option><option value="van">Van</option><option value="bike">Bike</option><option value="other">Other</option></select></div>
                <div className="form-group"><label className="form-label">Max Load (kg)</label><input className="form-input" type="number" value={form.max_load_capacity_kg} onChange={e => setForm({...form, max_load_capacity_kg: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Region</label><input className="form-input" value={form.region} onChange={e => setForm({...form, region: e.target.value})} /></div>
                <div className="form-group"><label className="form-label">Acquisition Cost (₹)</label><input className="form-input" type="number" value={form.acquisition_cost} onChange={e => setForm({...form, acquisition_cost: e.target.value})} /></div>
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
                <button type="submit" className="button button-primary">{editingVehicleId === null ? 'Create' : 'Save changes'}</button>
                <button type="button" className="button button-secondary" onClick={()=>{setShowForm(false);setEditingVehicleId(null);}}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          <div className="card-header"><input className="form-input" style={{maxWidth:380}} placeholder="Search registration, model, region or status..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Registration</th><th>Model</th><th>Type</th><th>Capacity (kg)</th><th>Odometer (km)</th><th>Region</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v.id}>
                    <td style={{fontWeight:500}}>{v.registration_number}</td>
                    <td>{v.name_model}</td>
                    <td>{v.type}</td>
                    <td>{v.max_load_capacity_kg.toLocaleString()}</td>
                    <td>{v.odometer_km.toLocaleString()}</td>
                    <td>{v.region || '—'}</td>
                    <td><span className={`status-badge status-badge-${v.status}`}>{v.status.replace('_',' ')}</span></td>
                    {canWrite && <td><div className="table-actions"><button className="button button-small button-secondary" onClick={()=>openEditForm(v)}>Edit</button><button className="button button-small button-danger" onClick={()=>setVehiclePendingDeletion(v)}>Delete</button></div></td>}
                  </tr>
                ))}
                {filteredVehicles.length === 0 && <tr><td colSpan={8} className="data-table-empty">No vehicles found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {vehiclePendingDeletion && <ConfirmationDialog title="Delete vehicle?" message={`Delete ${vehiclePendingDeletion.registration_number}? Vehicles with trip history must be retained and cannot be deleted.`} confirmLabel="Delete vehicle" isProcessing={isDeleting} onConfirm={handleDelete} onCancel={() => setVehiclePendingDeletion(null)} />}
    </>
  );
}
