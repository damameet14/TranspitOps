import { useEffect, useMemo, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';
import ConfirmationDialog from '../shared/confirmation_dialog';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

interface Driver {
  id: number; name: string; email: string; license_number: string; license_category: string;
  license_expiry_date: string; contact_number: string; safety_score: number;
  status: string; is_license_expired: boolean;
}

export default function DriversPage() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<number | null>(null);
  const [driverPendingDeletion, setDriverPendingDeletion] = useState<Driver | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [search,setSearch]=useState('');
  const [form, setForm] = useState({ name: '', email: '', license_number: '', license_category: 'LMV-TR', license_expiry_date: '', contact_number: '', safety_score: '100', status:'available' });
  const canWrite = user?.role === 'fleet_manager' || user?.role === 'safety_officer';

  const fetchDrivers = () => { apiClient.get('/drivers').then(r => setDrivers(r.data)).catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Drivers could not be loaded.'))).finally(() => setLoading(false)); };
  useEffect(fetchDrivers, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const driverPayload = { ...form, safety_score: +form.safety_score };
      if (editingDriverId === null) await apiClient.post('/drivers', driverPayload);
      else await apiClient.put(`/drivers/${editingDriverId}`, driverPayload);
      setShowForm(false);
      setEditingDriverId(null);
      setForm({ name: '', email: '', license_number: '', license_category: 'LMV-TR', license_expiry_date: '', contact_number: '', safety_score: '100', status:'available' });
      fetchDrivers();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, editingDriverId === null ? 'Driver could not be created.' : 'Driver could not be updated.')); }
  };

  const openCreateForm = () => {
    setEditingDriverId(null);
    setForm({ name: '', email: '', license_number: '', license_category: 'LMV-TR', license_expiry_date: '', contact_number: '', safety_score: '100', status:'available' });
    setShowForm(true);
  };

  const openEditForm = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setForm({ name: driver.name, email: driver.email, license_number: driver.license_number, license_category: driver.license_category, license_expiry_date: driver.license_expiry_date, contact_number: driver.contact_number, safety_score: String(driver.safety_score), status:driver.status });
    setShowForm(true);
  };
  const filteredDrivers=useMemo(()=>drivers.filter(driver=>`${driver.name} ${driver.email} ${driver.license_number} ${driver.status}`.toLowerCase().includes(search.toLowerCase())),[drivers,search]);

  const handleDelete = async () => {
    if (!driverPendingDeletion) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/drivers/${driverPendingDeletion.id}`);
      setDriverPendingDeletion(null);
      fetchDrivers();
    } catch (error) {
      setFeedbackMessage(getApiErrorMessage(error, 'Driver could not be deleted.'));
      setDriverPendingDeletion(null);
    } finally { setIsDeleting(false); }
  };
  const sendLicenseReminders=async()=>{try{const response=await apiClient.post('/drivers/license-reminders?days=30');setFeedbackMessage(`License reminders processed: ${response.data.sent} sent, ${response.data.failed} failed.`);}catch(error){setFeedbackMessage(getApiErrorMessage(error,'License reminders could not be sent.'));}};

  if (loading) return <div className="page-content"><p className="text-muted">Loading...</p></div>;

  return (
    <>
      <div className="topbar">
        <h2 className="topbar-title">Drivers</h2>
        <div className="topbar-actions">
          {canWrite && <><button className="button button-secondary" onClick={sendLicenseReminders}>Send License Reminders</button><button className="button button-primary" onClick={openCreateForm}>+ Add Driver</button></>}
        </div>
      </div>
      <div className="page-content">
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
        {showForm && (
          <div className="card mb-6">
            <h3 className="card-title mb-4">{editingDriverId === null ? 'New Driver' : 'Edit Driver'}</h3>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              </div>
              {editingDriverId !== null && <div className="form-row"><div className="form-group"><label className="form-label">Duty Status</label><select className="form-select" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} disabled={form.status==='on_trip'}><option value="available">Available</option><option value="off_duty">Off duty</option><option value="suspended">Suspended</option>{form.status==='on_trip'&&<option value="on_trip">On trip (workflow controlled)</option>}</select></div></div>}
              <div className="form-row">
                <div className="form-group"><label className="form-label">License Number</label><input className="form-input" value={form.license_number} onChange={e => setForm({...form, license_number: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">License Category</label><input className="form-input" value={form.license_category} onChange={e => setForm({...form, license_category: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">License Expiry</label><input className="form-input" type="date" value={form.license_expiry_date} onChange={e => setForm({...form, license_expiry_date: e.target.value})} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Contact Number</label><input className="form-input" value={form.contact_number} onChange={e => setForm({...form, contact_number: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Safety Score (0-100)</label><input className="form-input" type="number" min="0" max="100" value={form.safety_score} onChange={e => setForm({...form, safety_score: e.target.value})} /></div>
              </div>
              <div style={{display:'flex',gap:'var(--space-3)',marginTop:'var(--space-3)'}}>
                <button type="submit" className="button button-primary">{editingDriverId === null ? 'Create' : 'Save changes'}</button>
                <button type="button" className="button button-secondary" onClick={()=>{setShowForm(false);setEditingDriverId(null);}}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="card">
          <div className="card-header"><input className="form-input" style={{maxWidth:380}} placeholder="Search name, email, license or status..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Email</th><th>License No.</th><th>Category</th><th>Expiry</th><th>Contact</th><th>Safety</th><th>Status</th>{canWrite && <th>Actions</th>}</tr></thead>
              <tbody>
                {filteredDrivers.map(d => (
                  <tr key={d.id} className={d.is_license_expired ? 'row-overdue' : ''}>
                    <td style={{fontWeight:500}}>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.license_number}</td>
                    <td>{d.license_category}</td>
                    <td>{d.license_expiry_date}{d.is_license_expired && <span style={{color:'var(--feedback-danger-text)',marginLeft:'var(--space-2)',fontSize:'var(--font-size-caption)'}}>EXPIRED</span>}</td>
                    <td>{d.contact_number}</td>
                    <td><span style={{fontWeight:500,color:d.safety_score >= 80 ? 'var(--state-available-text)' : d.safety_score >= 50 ? 'var(--state-in-shop-text)' : 'var(--state-suspended-text)'}}>{d.safety_score}</span></td>
                    <td><span className={`status-badge status-badge-${d.status}`}>{d.status.replace('_',' ')}</span></td>
                    {canWrite && <td><div className="table-actions"><button className="button button-small button-secondary" onClick={()=>openEditForm(d)}>Edit</button><button className="button button-small button-danger" onClick={()=>setDriverPendingDeletion(d)}>Delete</button></div></td>}
                  </tr>
                ))}
                {filteredDrivers.length === 0 && <tr><td colSpan={9} className="data-table-empty">No drivers found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {driverPendingDeletion && <ConfirmationDialog title="Delete driver?" message={`Delete ${driverPendingDeletion.name}? Drivers with trip history must be retained and cannot be deleted.`} confirmLabel="Delete driver" isProcessing={isDeleting} onConfirm={handleDelete} onCancel={() => setDriverPendingDeletion(null)} />}
    </>
  );
}
