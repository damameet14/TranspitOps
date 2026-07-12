import { useEffect, useState } from 'react';
import apiClient from '../shared/api_client';
import { useAuth } from '../shared/auth_context';
import ConfirmationDialog from '../shared/confirmation_dialog';
import FeedbackCard from '../shared/feedback_card';
import { getApiErrorMessage } from '../shared/api_error_message';

interface Trip { id:number; source:string; destination:string; vehicle_id:number; driver_id:number; cargo_weight_kg:number; revenue:number; status:string; vehicle_registration_number:string|null; driver_name:string|null; }
interface VehicleOption { id:number; registration_number:string; name_model:string; max_load_capacity_kg:number; }
interface DriverOption { id:number; name:string; license_number:string; }
interface ServiceLocation { id:number; city:string; state:string; }
interface DriverRecommendation extends DriverOption { recommendation_score:number; recommendation_reason:string; }

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const createEmptyForm = (isPastTrip = false) => ({ source_street_address:'', source_location_id:'', source_state:'', destination_street_address:'', destination_location_id:'', destination_state:'', trip_date:isPastTrip?'':today(), vehicle_id:'', driver_id:'', cargo_weight_kg:'', planned_distance_km:'', revenue:'', is_past_trip:isPastTrip, final_odometer_km:'', fuel_consumed_liters:'', fuel_cost:'', actual_distance_km:'' });

export default function TripsPage() {
  const { user } = useAuth();
<<<<<<< HEAD
  const [trips,setTrips]=useState<Trip[]>([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(createEmptyForm());
  const [vehicles,setVehicles]=useState<VehicleOption[]>([]);
  const [drivers,setDrivers]=useState<DriverOption[]>([]);
  const [locations,setLocations]=useState<ServiceLocation[]>([]);
  const [recommendedDriver,setRecommendedDriver]=useState<DriverRecommendation|null>(null);
  const [feedbackMessage,setFeedbackMessage]=useState('');
  const [processingTripId,setProcessingTripId]=useState<number|null>(null);
  const [tripPendingCancellation,setTripPendingCancellation]=useState<Trip|null>(null);
  const [isProcessing,setIsProcessing]=useState(false);
  const [completeTrip,setCompleteTrip]=useState<{id:number;form:{final_odometer_km:string;fuel_consumed_liters:string;fuel_cost:string;actual_distance_km:string}}|null>(null);
  const canCreate=user?.role==='fleet_manager'||user?.role==='admin';
  const canManageLifecycle=canCreate||user?.role==='driver';

  const fetchTrips=()=>apiClient.get('/trips').then(response=>setTrips(response.data)).catch(error=>setFeedbackMessage(getApiErrorMessage(error,'Trips could not be loaded.'))).finally(()=>setLoading(false));
  useEffect(()=>{fetchTrips();},[]);

  const openForm=async(isPastTrip:boolean)=>{
    setForm(createEmptyForm(isPastTrip)); setRecommendedDriver(null);
    try { const [vehicleResponse,driverResponse,locationResponse]=await Promise.all([apiClient.get('/vehicles/available'),apiClient.get('/drivers/available'),apiClient.get('/locations')]); setVehicles(vehicleResponse.data);setDrivers(driverResponse.data);setLocations(locationResponse.data);setShowForm(true); }
    catch(error){setFeedbackMessage(getApiErrorMessage(error,'Trip resources could not be loaded.'));}
  };

  useEffect(()=>{
    if(!form.vehicle_id||!form.source_location_id||!showForm){setRecommendedDriver(null);return;}
    apiClient.get('/drivers/recommendations',{params:{vehicle_id:+form.vehicle_id,location_id:+form.source_location_id}}).then(response=>{const recommendation=response.data[0] as DriverRecommendation|undefined;setRecommendedDriver(recommendation??null);if(recommendation)setForm(current=>({...current,driver_id:String(recommendation.id)}));}).catch(()=>setRecommendedDriver(null));
  },[form.vehicle_id,form.source_location_id,showForm]);

  const suggestRoute=async()=>{const source=locations.find(item=>String(item.id)===form.source_location_id);const destination=locations.find(item=>String(item.id)===form.destination_location_id);if(!source||!destination)return;try{const response=await apiClient.post('/routes/suggest',{source:source.city,destination:destination.city});setForm(current=>({...current,planned_distance_km:String(response.data.suggested_distance_km)}));}catch(error){setFeedbackMessage(getApiErrorMessage(error,'A route could not be suggested.'));}};
  const handleCreate=async(event:React.FormEvent)=>{event.preventDefault();try{await apiClient.post('/trips',{...form,source_location_id:+form.source_location_id,destination_location_id:+form.destination_location_id,vehicle_id:+form.vehicle_id,driver_id:+form.driver_id,cargo_weight_kg:+form.cargo_weight_kg,planned_distance_km:+form.planned_distance_km,revenue:+form.revenue,final_odometer_km:form.final_odometer_km?+form.final_odometer_km:null,fuel_consumed_liters:form.fuel_consumed_liters?+form.fuel_consumed_liters:null,fuel_cost:form.fuel_cost?+form.fuel_cost:null,actual_distance_km:form.actual_distance_km?+form.actual_distance_km:null});setShowForm(false);fetchTrips();}catch(error){setFeedbackMessage(getApiErrorMessage(error,'Trip could not be created.'));}};
  const performAction=async(id:number,action:string,payload?:object)=>{if(processingTripId!==null)return;setProcessingTripId(id);try{await apiClient.post(`/trips/${id}/${action}`,payload);setCompleteTrip(null);fetchTrips();}catch(error){setFeedbackMessage(getApiErrorMessage(error,`Trip could not be ${action}ed.`));}finally{setProcessingTripId(null);}};
  const handleCancel=async()=>{if(!tripPendingCancellation)return;setIsProcessing(true);await performAction(tripPendingCancellation.id,'cancel');setTripPendingCancellation(null);setIsProcessing(false);};
  const handleComplete=(event:React.FormEvent)=>{event.preventDefault();if(!completeTrip)return;performAction(completeTrip.id,'complete',Object.fromEntries(Object.entries(completeTrip.form).map(([key,value])=>[key,+value])));};

  if(loading)return <div className="page-content"><p className="text-muted">Loading...</p></div>;
  return <>
    <div className="topbar"><h2 className="topbar-title">{user?.role==='driver'?'My Trips':'Trips Management'}</h2><div className="topbar-actions">{canCreate&&<><button className="button button-secondary" onClick={()=>openForm(true)}>Add Past Trip</button><button className="button button-primary" onClick={()=>openForm(false)}>+ Create Trip</button></>}</div></div>
    <div className="page-content"><FeedbackCard message={feedbackMessage} onDismiss={()=>setFeedbackMessage('')}/>
      {showForm&&<div className="card mb-6"><h3 className="card-title mb-4">{form.is_past_trip?'Add Completed Past Trip':'Create Trip'}</h3><form onSubmit={handleCreate}>
        <div className="form-row"><AddressFields prefix="source" form={form} setForm={setForm} locations={locations}/><AddressFields prefix="destination" form={form} setForm={setForm} locations={locations}/></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Trip date</label><input className="form-input" type="date" min={form.is_past_trip?undefined:today()} max={form.is_past_trip?yesterday():undefined} value={form.trip_date} onChange={event=>setForm({...form,trip_date:event.target.value})} required/></div><div className="form-group" style={{alignSelf:'end'}}><button type="button" className="button button-secondary" onClick={suggestRoute}>Suggest route distance</button></div></div>
        <div className="form-row"><div className="form-group"><label className="form-label">Vehicle</label><select className="form-select" value={form.vehicle_id} onChange={event=>setForm({...form,vehicle_id:event.target.value})} required><option value="">Select vehicle…</option>{vehicles.map(vehicle=><option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number} — {vehicle.name_model} ({vehicle.max_load_capacity_kg} kg)</option>)}</select></div><div className="form-group"><label className="form-label">Driver</label><select className="form-select" value={form.driver_id} onChange={event=>setForm({...form,driver_id:event.target.value})} required><option value="">Select driver…</option>{drivers.map(driver=><option key={driver.id} value={driver.id}>{driver.name} ({driver.license_number})</option>)}</select>{recommendedDriver&&<div className="text-muted mt-4">Auto-selected: {recommendedDriver.recommendation_reason} · score {recommendedDriver.recommendation_score}</div>}</div></div>
        <div className="form-row"><NumberField label="Cargo weight (kg)" name="cargo_weight_kg" form={form} setForm={setForm}/><NumberField label="Planned distance (km)" name="planned_distance_km" form={form} setForm={setForm}/></div>
        <div className="form-row"><NumberField label="Revenue (₹)" name="revenue" form={form} setForm={setForm}/>{form.is_past_trip&&<NumberField label="Final odometer (km)" name="final_odometer_km" form={form} setForm={setForm}/>}</div>
        {form.is_past_trip&&<div className="form-row"><NumberField label="Actual distance (km)" name="actual_distance_km" form={form} setForm={setForm}/><NumberField label="Fuel consumed (liters)" name="fuel_consumed_liters" form={form} setForm={setForm}/><NumberField label="Fuel cost (₹)" name="fuel_cost" form={form} setForm={setForm}/></div>}
        <div className="flex gap-3"><button className="button button-primary" type="submit">{form.is_past_trip?'Add Completed Trip':'Create as Draft'}</button><button className="button button-secondary" type="button" onClick={()=>setShowForm(false)}>Cancel</button></div>
      </form></div>}
      <div className="card"><div className="data-table-container"><table className="data-table"><thead><tr><th>ID</th><th>Route</th><th>Vehicle</th><th>Driver</th><th>Cargo</th><th>Revenue</th><th>Status</th>{canManageLifecycle&&<th>Actions</th>}</tr></thead><tbody>{trips.map(trip=><tr key={trip.id}><td>#{trip.id}</td><td>{trip.source} → {trip.destination}</td><td>{trip.vehicle_registration_number||`#${trip.vehicle_id}`}</td><td>{trip.driver_name||`#${trip.driver_id}`}</td><td>{trip.cargo_weight_kg} kg</td><td>₹{trip.revenue.toLocaleString()}</td><td><span className={`status-badge status-badge-${trip.status}`}>{trip.status}</span></td>{canManageLifecycle&&<td className="data-table-actions">{trip.status==='draft'&&<button className="button button-small button-primary" onClick={()=>performAction(trip.id,'dispatch')}>Dispatch</button>}{trip.status==='dispatched'&&<button className="button button-small button-primary" onClick={()=>setCompleteTrip({id:trip.id,form:{final_odometer_km:'',fuel_consumed_liters:'',fuel_cost:'',actual_distance_km:''}})}>Complete</button>}{['draft','dispatched'].includes(trip.status)&&<button className="button button-small button-danger" onClick={()=>setTripPendingCancellation(trip)}>Cancel</button>}</td>}</tr>)}{trips.length===0&&<tr><td colSpan={8} className="data-table-empty">No trips found</td></tr>}</tbody></table></div></div>
    </div>
    {completeTrip&&<div className="modal-overlay"><div className="modal-container"><div className="modal-header"><h3 className="modal-title">Complete Trip #{completeTrip.id}</h3></div><form onSubmit={handleComplete}><div className="modal-body">{Object.keys(completeTrip.form).map(name=><div className="form-group" key={name}><label className="form-label">{name.replaceAll('_',' ')}</label><input className="form-input" type="number" value={completeTrip.form[name as keyof typeof completeTrip.form]} onChange={event=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,[name]:event.target.value}})} required/></div>)}</div><div className="modal-footer"><button type="button" className="button button-secondary" onClick={()=>setCompleteTrip(null)}>Cancel</button><button className="button button-primary">Complete Trip</button></div></form></div></div>}
    {tripPendingCancellation&&<ConfirmationDialog title="Cancel trip?" message={`Cancel trip #${tripPendingCancellation.id}?`} confirmLabel="Cancel trip" isProcessing={isProcessing} onConfirm={handleCancel} onCancel={()=>setTripPendingCancellation(null)}/>}</>;
=======
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tripPendingCancellation, setTripPendingCancellation] = useState<Trip | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTripId, setProcessingTripId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [routeSuggestion, setRouteSuggestion] = useState<RouteSuggestion | null>(null);
  const [completeTrip, setCompleteTrip] = useState<{id: number; form: {final_odometer_km: string; fuel_consumed_liters: string; fuel_cost: string; actual_distance_km: string}} | null>(null);
  const [form, setForm] = useState({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight_kg: '', planned_distance_km: '', revenue: '' });
  const canWrite = user?.role === 'fleet_manager' || user?.role === 'driver';

  const fetchTrips = () => { apiClient.get('/trips').then(r => setTrips(r.data)).catch(error => setFeedbackMessage(getApiErrorMessage(error, 'Trips could not be loaded.'))).finally(() => setLoading(false)); };
  useEffect(fetchTrips, []);

  const openForm = async () => {
    try {
      const [v, d] = await Promise.all([apiClient.get('/vehicles/available'), apiClient.get('/drivers/available')]);
      const driverOptions: DriverOption[] = user?.role === 'driver'
        ? d.data.filter((driver: DriverOption) => driver.id === user.driver_id)
        : d.data;
      setVehicles(v.data); setDrivers(driverOptions);
      setForm(current => ({ ...current, driver_id: user?.role === 'driver' && user.driver_id ? String(user.driver_id) : current.driver_id }));
      setShowForm(true);
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Available resources could not be loaded.')); }
  };

  const handleSuggestRoute = async () => {
    if (!form.source || !form.destination) return;
    try {
      const r = await apiClient.post('/routes/suggest', { source: form.source, destination: form.destination });
      setRouteSuggestion(r.data);
      setForm(f => ({ ...f, planned_distance_km: String(r.data.suggested_distance_km) }));
    } catch (error) { setRouteSuggestion(null); setFeedbackMessage(getApiErrorMessage(error, 'A route could not be suggested.')); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/trips', { ...form, vehicle_id: +form.vehicle_id, driver_id: +form.driver_id, cargo_weight_kg: +form.cargo_weight_kg, planned_distance_km: +form.planned_distance_km, revenue: +form.revenue });
      setShowForm(false); setRouteSuggestion(null);
      setForm({ source: '', destination: '', vehicle_id: '', driver_id: '', cargo_weight_kg: '', planned_distance_km: '', revenue: '' });
      fetchTrips();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Trip could not be created.')); }
  };

  const handleDispatch = async (id: number) => {
    if (processingTripId !== null) return;
    setProcessingTripId(id);
    try { await apiClient.post(`/trips/${id}/dispatch`); fetchTrips(); }
    catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Trip could not be dispatched.')); }
    finally { setProcessingTripId(null); }
  };
  const handleCancel = async () => {
    if (!tripPendingCancellation) return;
    setIsProcessing(true);
    try { await apiClient.post(`/trips/${tripPendingCancellation.id}/cancel`); setTripPendingCancellation(null); fetchTrips(); }
    catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Trip could not be cancelled.')); setTripPendingCancellation(null); }
    finally { setIsProcessing(false); }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTrip || processingTripId !== null) return;
    setProcessingTripId(completeTrip.id);
    try {
      await apiClient.post(`/trips/${completeTrip.id}/complete`, { final_odometer_km: +completeTrip.form.final_odometer_km, fuel_consumed_liters: +completeTrip.form.fuel_consumed_liters, fuel_cost: +completeTrip.form.fuel_cost, actual_distance_km: +completeTrip.form.actual_distance_km });
      setCompleteTrip(null); fetchTrips();
    } catch (error) { setFeedbackMessage(getApiErrorMessage(error, 'Trip could not be completed.')); }
    finally { setProcessingTripId(null); }
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
        <FeedbackCard message={feedbackMessage} onDismiss={() => setFeedbackMessage('')} />
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
                  <select className="form-select" value={form.driver_id} onChange={e => setForm({...form, driver_id: e.target.value})} required disabled={user?.role === 'driver'}>
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
                  <div className="form-group"><label className="form-label">Fuel Cost (₹)</label><input className="form-input" type="number" min="0.01" step="0.01" value={completeTrip.form.fuel_cost} onChange={e=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,fuel_cost:e.target.value}})} required /></div>
                  <div className="form-group"><label className="form-label">Actual Distance (km)</label><input className="form-input" type="number" value={completeTrip.form.actual_distance_km} onChange={e=>setCompleteTrip({...completeTrip,form:{...completeTrip.form,actual_distance_km:e.target.value}})} required /></div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="button button-secondary" onClick={()=>setCompleteTrip(null)}>Cancel</button>
                  <button type="submit" className="button button-primary" disabled={processingTripId === completeTrip.id}>{processingTripId === completeTrip.id ? 'Completing…' : 'Complete Trip'}</button>
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
                      {t.status === 'draft' && <button className="button button-small button-primary" disabled={processingTripId !== null} onClick={()=>handleDispatch(t.id)}>Dispatch</button>}
                      {t.status === 'dispatched' && <button className="button button-small button-primary" disabled={processingTripId !== null} onClick={()=>setCompleteTrip({id:t.id,form:{final_odometer_km:'',fuel_consumed_liters:'',fuel_cost:'',actual_distance_km:''}})}>Complete</button>}
                      {(t.status === 'draft' || t.status === 'dispatched') && <button className="button button-small button-danger" onClick={()=>setTripPendingCancellation(t)}>Cancel</button>}
                    </td>}
                  </tr>
                ))}
                {trips.length === 0 && <tr><td colSpan={8} className="data-table-empty">No trips found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {tripPendingCancellation && <ConfirmationDialog title="Cancel trip?" message={`Cancel trip #${tripPendingCancellation.id} from ${tripPendingCancellation.source} to ${tripPendingCancellation.destination}? This follows the trip state-transition rules and cannot be undone.`} confirmLabel="Cancel trip" isProcessing={isProcessing} onConfirm={handleCancel} onCancel={() => setTripPendingCancellation(null)} />}
    </>
  );
>>>>>>> 8b2d77ce78de4ecc024e41e576d67e9f1ba9f407
}

type TripForm=ReturnType<typeof createEmptyForm>;
function AddressFields({prefix,form,setForm,locations}:{prefix:'source'|'destination';form:TripForm;setForm:React.Dispatch<React.SetStateAction<TripForm>>;locations:ServiceLocation[]}){
  const streetKey=`${prefix}_street_address` as const;
  const locationKey=`${prefix}_location_id` as const;
  const stateKey=`${prefix}_state` as 'source_state'|'destination_state';
  const selectedState=(form as Record<string,string>)[stateKey]||'';
  const uniqueStates=[...new Set(locations.map(l=>l.state))].sort();
  const filteredCities=selectedState?locations.filter(l=>l.state===selectedState):[];
  const handleStateChange=(value:string)=>{setForm(prev=>({...prev,[stateKey]:value,[locationKey]:''}));};
  const handleCityChange=(value:string)=>{setForm(prev=>({...prev,[locationKey]:value}));};
  return <fieldset className="card"><legend className="form-label">{prefix==='source'?'Source':'Destination'}</legend>
    <div className="form-group"><input className="form-input" placeholder="Street address" value={form[streetKey]} onChange={event=>setForm({...form,[streetKey]:event.target.value})} required/></div>
    <div className="form-row">
      <div className="form-group"><label className="form-label">State</label><select className="form-select" value={selectedState} onChange={e=>handleStateChange(e.target.value)} required><option value="">Select state…</option>{uniqueStates.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
      <div className="form-group"><label className="form-label">City</label><select className="form-select" value={form[locationKey]} onChange={e=>handleCityChange(e.target.value)} required disabled={!selectedState}><option value="">Select city…</option>{filteredCities.map(l=><option key={l.id} value={l.id}>{l.city}</option>)}</select></div>
    </div>
  </fieldset>}
function NumberField({label,name,form,setForm}:{label:string;name:keyof TripForm;form:TripForm;setForm:React.Dispatch<React.SetStateAction<TripForm>>}){return <div className="form-group"><label className="form-label">{label}</label><input className="form-input" type="number" step="0.1" value={String(form[name])} onChange={event=>setForm({...form,[name]:event.target.value})} required/></div>}
