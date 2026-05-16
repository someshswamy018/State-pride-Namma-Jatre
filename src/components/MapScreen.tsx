import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Plus, 
  Minus, 
  Navigation, 
  ShieldCheck, 
  PlusSquare, 
  Droplets, 
  LogOut, 
  Info,
  Car,
  AlertTriangle,
  LocateFixed,
  Search,
  Loader2,
  X
} from "lucide-react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  useMap,
  ZoomControl,
  Circle
} from 'react-leaflet';
import L from 'leaflet';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ParkingLocation, SafetyAlert } from '../types';
import { cn } from '../lib/utils';

// melukote coordinates as a base
const CENTER: [number, number] = [12.6644, 76.6544];

const SEED_LOCATIONS: Partial<ParkingLocation>[] = [
  { name: 'Parking A', type: 'parking', latitude: 12.6655, longitude: 76.6530, capacity: '200 Slots', status: 'Available', description: 'Main parking area near North Gate' },
  { name: 'Parking B', type: 'parking', latitude: 12.6630, longitude: 76.6555, capacity: '150 Slots', status: 'Filling Fast', description: 'Secondary parking near South Entrance' },
  { name: 'Police Help Desk', type: 'police', latitude: 12.6644, longitude: 76.6540, status: 'Active', description: 'Emergency assistance and crowd management' },
  { name: 'First Aid Center', type: 'medical', latitude: 12.6650, longitude: 76.6550, status: 'Active', description: '24/7 Medical support and ambulance' },
  { name: 'Temple Main Gate', type: 'temple', latitude: 12.6640, longitude: 76.6548, status: 'Open', description: 'Entry point for main temple' },
  { name: 'Drinking Water', type: 'water', latitude: 12.6648, longitude: 76.6542, status: 'Available', description: 'RO purified drinking water' },
  { name: 'Exit Gate', type: 'exit', latitude: 12.6625, longitude: 76.6550, status: 'Clear', description: 'Designated exit for vehicles' }
];

// Helper to center map
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [center, map]);
  return null;
}

const getPinColor = (type: ParkingLocation['type']) => {
  switch (type) {
    case 'parking': return '#4CAF50';
    case 'police': return '#1A237E';
    case 'medical': return '#F44336';
    case 'temple': return '#4CAF50';
    case 'water': return '#00BCD4';
    case 'exit': return '#F44336';
    default: return '#F27D26';
  }
};

const getLocationIcon = (type: ParkingLocation['type']) => {
  switch (type) {
    case 'parking': return <Car className="w-4 h-4" />;
    case 'police': return <ShieldCheck className="w-4 h-4" />;
    case 'medical': return <PlusSquare className="w-4 h-4" />;
    case 'temple': return <MapPin className="w-4 h-4" />;
    case 'water': return <Droplets className="w-4 h-4" />;
    case 'exit': return <LogOut className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

const createCustomIcon = (type: ParkingLocation['type'], isSelected: boolean) => {
  const color = getPinColor(type);
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="flex items-center justify-center transition-all duration-300 ${isSelected ? 'scale-125' : 'scale-100'}" style="width: 40px; height: 40px;">
        <div style="background-color: ${color}; padding: 8px; border-radius: 12px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'parking' ? '<path d="m11 20-3-3m0 0-3 3m3-3V4"/>' : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'}
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function MapScreen() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<ParkingLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(CENTER);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const snap = await getDocs(collection(db, 'parking_locations'));
        if (snap.empty) {
          // Double check
          const secondSnap = await getDocs(collection(db, 'parking_locations'));
          if (secondSnap.empty) {
            for (const loc of SEED_LOCATIONS) {
              await addDoc(collection(db, 'parking_locations'), {
                ...loc,
                updatedAt: serverTimestamp()
              });
            }
          }
        }
      } catch (err) {
        console.error('Seeding Error:', err);
      }
    };
    checkAndSeed();

    const unsubLocs = onSnapshot(collection(db, 'parking_locations'), (snap) => {
      const locList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ParkingLocation));
      // Deduplicate
      const uniqueLocs = locList.reduce((acc, current) => {
        const x = acc.find(item => item.name === current.name);
        if (!x) return acc.concat([current]);
        return acc;
      }, [] as ParkingLocation[]);
      
      setLocations(uniqueLocs);
      setLoading(false);
    }, (err) => {
      console.error('Firestore Snapshot Error:', err);
      setLoading(false);
    });

    const unsubAlerts = onSnapshot(collection(db, 'safety_alerts'), (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as SafetyAlert)));
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubLocs();
      unsubAlerts();
      clearTimeout(timer);
    };
  }, []);

  const handleLocSelect = (loc: ParkingLocation) => {
    setSelectedLoc(loc);
    setMapCenter([loc.latitude, loc.longitude]);
    setShowDetails(true);
  };

  return (
    <div className="h-screen bg-[#FDF5E6] flex flex-col max-w-md mx-auto w-full relative shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-orange-100 flex items-center px-6 py-5 z-[1000] sticky top-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-[#002D72] active:scale-95 transition-transform">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="ml-4 font-serif text-xl font-black text-[#002D72] uppercase tracking-tight">
          Parking & Safety Map
        </h1>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-[#FDF5E6]/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 text-[#F27D26] animate-spin mb-4" />
            <p className="font-bold text-[#002D72] opacity-40 uppercase tracking-widest text-xs">Loading Jatre Map...</p>
          </div>
        ) : (
          <MapContainer 
            center={CENTER} 
            zoom={17} 
            style={{ height: '100%', width: '100%' }}
            className="outline-none z-0"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            
            <ChangeView center={mapCenter} />

            {/* Custom Markers */}
            {locations.map((loc) => (
              <Marker 
                key={loc.id} 
                position={[loc.latitude, loc.longitude]}
                icon={createCustomIcon(loc.type, selectedLoc?.id === loc.id)}
                eventHandlers={{
                  click: () => handleLocSelect(loc)
                }}
              />
            ))}

            {/* User Real-time simulated location */}
            <Circle 
              center={[12.6644, 76.6544]} 
              radius={15}
              pathOptions={{ 
                fillColor: '#3B82F6', 
                fillOpacity: 1, 
                color: 'white', 
                weight: 3,
                className: 'pulse-marker'
              }}
            />
            <Circle 
              center={[12.6644, 76.6544]} 
              radius={50}
              pathOptions={{ fillColor: '#3B82F6', fillOpacity: 0.1, color: 'transparent' }}
            />

            <ZoomControl position="bottomright" />
          </MapContainer>
        )}

        {/* Floating Side Cards */}
        <div className="absolute left-4 top-4 z-[500] bottom-4 overflow-y-auto pointer-events-none w-64 scrollbar-hide py-2">
           <AnimatePresence mode="popLayout">
           <div className="flex flex-col gap-3">
             {locations.map((loc, idx) => (
               <motion.div
                 key={loc.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: idx * 0.1 }}
                 onClick={() => handleLocSelect(loc)}
                 className={cn(
                   "bg-white rounded-2xl p-3 shadow-lg border-2 pointer-events-auto cursor-pointer active:scale-95 transition-all flex items-center gap-3",
                   selectedLoc?.id === loc.id ? "border-[#F27D26]" : "border-transparent"
                 )}
               >
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0",
                   selectedLoc?.id === loc.id ? "scale-110 shadow-md" : ""
                 )} style={{ backgroundColor: getPinColor(loc.type) }}>
                   {getLocationIcon(loc.type)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="font-black text-[#002D72] text-[13px] uppercase truncate">{loc.name}</h3>
                   {loc.capacity && (
                     <p className="text-[10px] font-bold text-[#F27D26] uppercase tracking-tighter">{loc.capacity}</p>
                   )}
                 </div>
               </motion.div>
             ))}
           </div>
           </AnimatePresence>
        </div>

        {/* Safety Alert Banner */}
        {alerts.length > 0 && (
          <div className="absolute top-4 right-4 z-[500] max-w-[240px]">
            {alerts.map(alert => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl shadow-xl flex gap-3 items-start",
                  alert.type === 'emergency' ? "bg-red-500 text-white" : "bg-white border-2 border-orange-100"
                )}
              >
                <AlertTriangle className={cn("w-5 h-5 shrink-0", alert.type === 'emergency' ? "text-white" : "text-red-500")} />
                <div>
                  <h4 className="font-black text-xs uppercase mb-1">{alert.title}</h4>
                  <p className="text-[10px] font-medium leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Location Details Bottom Sheet (Simulated) */}
        <AnimatePresence>
          {showDetails && selectedLoc && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-6 left-6 right-6 z-[1000] bg-white rounded-[2.5rem] p-8 shadow-2xl border border-orange-50"
            >
              <button 
                onClick={() => setShowDetails(false)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                 <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: getPinColor(selectedLoc.type) }}>
                   {getLocationIcon(selectedLoc.type)}
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F27D26] bg-orange-50 px-2 py-0.5 rounded-lg mb-1 inline-block">
                      {selectedLoc.status}
                    </span>
                    <h2 className="text-2xl font-black text-[#002D72] font-serif leading-tight">{selectedLoc.name}</h2>
                 </div>
              </div>

              <p className="text-sm font-medium text-[#002D72]/60 mb-8">{selectedLoc.description}</p>

              <div className="flex items-center gap-4">
                 <button className="flex-1 bg-[#F27D26] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-orange-100 active:scale-95 transition-transform">
                   <Navigation className="w-5 h-5" />
                   Navigate
                 </button>
                 <button className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                    <Info className="w-7 h-7" />
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Controls */}
        <div className="absolute right-6 bottom-32 z-[500] flex flex-col gap-3">
           <button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-[#002D72] active:scale-90 transition-transform">
             <LocateFixed className="w-6 h-6" />
           </button>
        </div>
      </div>

      <style>{`
        .leaflet-container {
          background: #FDF5E6 !important;
        }
        .pulse-marker {
          animation: marker-pulse 2s infinite ease-out;
        }
        @keyframes marker-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-div-icon {
          background: none !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
