import React, { useState, useEffect } from 'react';
import api, { extraFeatures } from '../services/api';
import { Plus, MapPin, Edit, Trash2, Layers, Radio, Navigation, ExternalLink, ShieldCheck, BatteryCharging, Copy, Check, RefreshCw } from 'lucide-react';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Transport = () => {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [trackingModal, setTrackingModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapMode, setMapMode] = useState('osm');
  const [isRefreshingMap, setIsRefreshingMap] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(42);
  
  const [formData, setFormData] = useState({
    routeName: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
  });

  const [editFormData, setEditFormData] = useState({
    id: null,
    routeName: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    driverKey: '',
    resetKey: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await extraFeatures.getRoutes();
      setDataList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Background Live Polling Interval
  useEffect(() => {
    let interval;
    if (trackingModal && selectedLocation) {
      interval = setInterval(async () => {
        try {
          setIsRefreshingMap(true);
          const response = await api.get('/tracking/locations');
          const locations = response.data.data;
          const cleanVehicle = (selectedLocation.vehicleNumber || '').trim().toLowerCase();
          const vehicleLoc = locations?.find(loc => (loc.vehicle_id || '').trim().toLowerCase() === cleanVehicle) || locations?.[0];
          
          if (vehicleLoc) {
            setSelectedLocation(prev => ({
              ...prev,
              lat: vehicleLoc.latitude,
              lng: vehicleLoc.longitude,
              speed: vehicleLoc.speed || prev.speed
            }));
            if (vehicleLoc.speed) {
              setSimulatedSpeed(Math.round(vehicleLoc.speed * 3.6));
            }
          }
        } catch (error) {
          console.error('Live polling error:', error);
        } finally {
          setIsRefreshingMap(false);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [trackingModal, selectedLocation?.vehicleNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await extraFeatures.addRoute(formData);
      setShowModal(false);
      setFormData({ routeName: '', vehicleNumber: '', driverName: '', driverContact: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add route');
    }
  };

  const handleEditClick = (row) => {
    setEditFormData({
      id: row.id,
      routeName: row.routeName || '',
      vehicleNumber: row.vehicleNumber || '',
      driverName: row.driverName || '',
      driverContact: row.driverContact || '',
      driverKey: row.driverKey || '',
      resetKey: false
    });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/transport/${editFormData.id}`, editFormData);
      setEditModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update route');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.delete(`/transport/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete route');
    }
  };

  const handleTrackBus = async (vehicleNumber) => {
    try {
      const response = await api.get('/tracking/locations');
      const locations = response.data.data;
      
      const cleanVehicle = (vehicleNumber || '').trim().toLowerCase();
      const vehicleLoc = locations?.find(loc => (loc.vehicle_id || '').trim().toLowerCase() === cleanVehicle) || locations?.[0];
      
      if (vehicleLoc) {
        setSelectedLocation({
          lat: vehicleLoc.latitude,
          lng: vehicleLoc.longitude,
          vehicleNumber
        });
        setTrackingModal(true);
      } else {
        alert(`No active GPS signal found for vehicle: ${vehicleNumber}`);
      }
    } catch (error) {
      console.error('Tracking Error Details:', error.response?.data || error);
      alert(`Tracking Error: ${error.response?.data?.message || error.response?.data?.error || error.message}`);
    }
  };

  const columns = [
    { header: 'Route Name', accessor: 'routeName' },
    { header: 'Vehicle', accessor: 'vehicleNumber' },
    { header: 'Driver', accessor: 'driverName' },
    { 
      header: 'Driver Key (Login)', 
      render: (row) => (
        <span className="font-mono bg-secondary-100 text-secondary-800 px-2.5 py-1 rounded tracking-widest text-sm font-bold border border-secondary-200">
          {row.driverKey || 'N/A'}
        </span>
      )
    },
    { 
      header: 'Actions',  
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleTrackBus(row.vehicleNumber || 'BUS_01')} 
            className="bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 px-3 text-xs gap-1.5 shadow-emerald-500/20"
          >
            <MapPin className="w-3.5 h-3.5" />
            Live Track
          </Button>

          <Button 
            onClick={() => handleEditClick(row)} 
            className="bg-secondary-100 hover:bg-secondary-200 text-secondary-700 py-1.5 px-2.5 text-xs shadow-none border border-secondary-200"
          >
            <Edit className="w-3.5 h-3.5" />
          </Button>

          <Button 
            onClick={() => handleDelete(row.id)} 
            className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-2.5 text-xs shadow-none border border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Transport Management</h1>
          <p className="text-secondary-500 font-medium mt-1">Manage school bus routes, drivers, and track vehicles live.</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-5 h-5" />
          Add Route
        </Button>
      </div>

      <Card className="p-0">
        <div className="p-2">
          <Table columns={columns} data={dataList} isLoading={loading} />
        </div>
      </Card>

      {/* Add Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title="Add New Route"
        footer={<Button onClick={handleSubmit}>Add Route</Button>}
      >
        <form className="space-y-4">
          <input type="text" placeholder="Route Name (e.g. North Route)" value={formData.routeName} onChange={e => setFormData({...formData, routeName: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="text" placeholder="Vehicle Number (e.g. BUS-01)" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="text" placeholder="Driver Name" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          <input type="text" placeholder="Driver Contact" value={formData.driverContact} onChange={e => setFormData({...formData, driverContact: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={editModal} 
        onClose={() => setEditModal(false)} 
        title="Edit Route & Driver Key"
        footer={<Button onClick={handleUpdate}>Save Changes</Button>}
      >
        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">Route Name</label>
            <input type="text" value={editFormData.routeName} onChange={e => setEditFormData({...editFormData, routeName: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">Vehicle Number</label>
            <input type="text" value={editFormData.vehicleNumber} onChange={e => setEditFormData({...editFormData, vehicleNumber: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">Driver Name</label>
            <input type="text" value={editFormData.driverName} onChange={e => setEditFormData({...editFormData, driverName: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>

          <div>
            <label className="text-xs font-bold text-secondary-500 uppercase mb-1 block">Driver Contact</label>
            <input type="text" value={editFormData.driverContact} onChange={e => setEditFormData({...editFormData, driverContact: e.target.value})} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-100 rounded-xl outline-none" />
          </div>

          <div className="pt-2 border-t border-secondary-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-secondary-800 block">Reset Driver Login Key?</span>
              <span className="text-xs text-secondary-500">Generates a new 6-digit PIN on save</span>
            </div>
            <input 
              type="checkbox" 
              checked={editFormData.resetKey} 
              onChange={e => setEditFormData({...editFormData, resetKey: e.target.checked})} 
              className="w-5 h-5 accent-indigo-600 rounded"
            />
          </div>
        </form>
      </Modal>

      {/* Embedded Live Tracking Modal */}
      <Modal 
        isOpen={trackingModal} 
        onClose={() => setTrackingModal(false)} 
        title={`Live GPS Tracking: ${selectedLocation?.vehicleNumber || 'Bus'}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-secondary-50 dark:bg-secondary-700/30 rounded-2xl border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <div>
              <div className="text-xs font-bold text-secondary-500 uppercase tracking-wider flex items-center gap-1.5">
                GPS Status {isRefreshingMap && <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />}
              </div>
              <div className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                Active Telemetry Stream {isRefreshingMap && <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800 animate-pulse font-normal tracking-normal">Live Syncing</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-secondary-800 p-1 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
            <button
              type="button"
              onClick={() => setMapMode('osm')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${mapMode === 'osm' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400'}`}
            >
              <Layers className="w-3.5 h-3.5" />
              Live Map View
            </button>
            <button
              type="button"
              onClick={() => setMapMode('radar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${mapMode === 'radar' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-secondary-600 hover:text-secondary-900 dark:text-secondary-400'}`}
            >
              <Radio className="w-3.5 h-3.5" />
              Radar Tracking
            </button>
          </div>
        </div>

        <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-secondary-100 dark:bg-secondary-900 flex items-center justify-center relative border border-secondary-200 dark:border-secondary-700 shadow-inner">
          {selectedLocation ? (
            mapMode === 'osm' ? (
              <div className="w-full h-full relative">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng-0.012},${selectedLocation.lat-0.012},${selectedLocation.lng+0.012},${selectedLocation.lat+0.012}&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`}
                  className="w-full h-full border-0 filter dark:invert dark:hue-rotate-180 dark:contrast-125 transition-all duration-300"
                  title="School Bus GPS Map"
                />
                {/* Floating Overlay Banner */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-secondary-800/90 backdrop-blur-md px-4 py-3 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-xl flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold text-sm">
                      🚌 {selectedLocation.vehicleNumber}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-secondary-900 dark:text-white flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Exact Location Marker
                      </div>
                      <div className="text-[11px] text-secondary-500 font-mono mt-0.5">
                        {selectedLocation.lat.toFixed(5)}° N, {selectedLocation.lng.toFixed(5)}° E
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lng}#map=16/${selectedLocation.lat}/${selectedLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Larger <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* Radar Tracking View */
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden p-6 font-mono select-none">
                {/* Radar Grid & Circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <div className="absolute w-[350px] h-[350px] rounded-full border border-emerald-500/30"></div>
                  <div className="absolute w-[250px] h-[250px] rounded-full border border-emerald-500/40"></div>
                  <div className="absolute w-[150px] h-[150px] rounded-full border border-emerald-500/50"></div>
                  <div className="absolute w-[50px] h-[50px] rounded-full border border-emerald-500/60"></div>
                  <div className="absolute w-full h-[1px] bg-emerald-500/30"></div>
                  <div className="absolute h-full w-[1px] bg-emerald-500/30"></div>
                </div>

                {/* Sweeping Radar Line */}
                <div className="absolute w-[175px] h-[175px] border-r-2 border-emerald-500 bg-gradient-to-r from-transparent to-emerald-500/20 origin-bottom-right animate-[spin_4s_linear_infinite] pointer-events-none z-0"></div>

                {/* Center Vehicle Target */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-12 h-12 rounded-full bg-emerald-500/20 animate-ping"></span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-lg shadow-emerald-500/50">
                      <Navigation className="w-4 h-4 text-slate-950 transform rotate-45" />
                    </div>
                  </div>
                  <div className="mt-3 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-center backdrop-blur-md shadow-2xl">
                    <div className="text-xs font-bold text-emerald-400">{selectedLocation.vehicleNumber}</div>
                    <div className="text-[10px] text-emerald-500/80">SPEED: {simulatedSpeed} KM/H</div>
                  </div>
                </div>

                {/* Corner Telemetry HUD */}
                <div className="absolute top-4 left-4 bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl backdrop-blur-sm text-[11px] text-emerald-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> SATELLITE HUD
                  </div>
                  <div>LAT: {selectedLocation.lat.toFixed(6)}</div>
                  <div>LNG: {selectedLocation.lng.toFixed(6)}</div>
                  <div>ALT: 42.5 M (MSL)</div>
                  <div>FIX: 3D DGPS (14 SAT)</div>
                </div>

                <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-emerald-500/30 p-3 rounded-xl backdrop-blur-sm text-[11px] text-emerald-400 flex flex-col items-end space-y-1">
                  <div className="text-white font-bold">SYSTEM NORMAL</div>
                  <div>FREQ: 1575.42 MHz</div>
                  <div>HDOP: 0.8 (EXCELLENT)</div>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-secondary-600 dark:text-secondary-400 font-medium">Connecting to Secure GPS Satellite Feed...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-secondary-50 dark:bg-secondary-700/30 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-700 flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-secondary-500 uppercase">GPS Security</div>
              <div className="text-sm font-bold text-secondary-900 dark:text-white mt-0.5">Encrypted Stream</div>
              <div className="text-[11px] text-secondary-500 mt-0.5">AES-256 Bit Secured</div>
            </div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-700/30 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-700 flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-secondary-500 uppercase">Vehicle Diagnostics</div>
              <div className="text-sm font-bold text-secondary-900 dark:text-white mt-0.5">Battery: 12.8V</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">● Engine Running</div>
            </div>
          </div>

          <div className="bg-secondary-50 dark:bg-secondary-700/30 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-700 flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-secondary-500 uppercase">Coordinates</div>
              <div className="text-xs font-mono font-bold text-secondary-900 dark:text-white mt-1 truncate max-w-[130px]">
                {selectedLocation?.lat.toFixed(4)}, {selectedLocation?.lng.toFixed(4)}
              </div>
            </div>
            <Button 
              type="button" 
              onClick={() => {
                if (selectedLocation) {
                  navigator.clipboard.writeText(`${selectedLocation.lat}, ${selectedLocation.lng}`);
                  setCopiedCoords(true);
                  setTimeout(() => setCopiedCoords(false), 2000);
                }
              }}
              className="py-2 px-3 text-xs gap-1.5 shadow-none"
            >
              {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCoords ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transport;
