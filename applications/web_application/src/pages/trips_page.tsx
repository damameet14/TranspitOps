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
