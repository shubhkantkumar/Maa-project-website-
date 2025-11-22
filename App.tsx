import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Shield, Radio, Zap, HeartPulse, MapPin, 
  Database, Cpu, Globe, Play, CheckCircle2, 
  Smartphone, Wifi, Activity, Film, Loader2, ChevronRight, Navigation,
  Plus, Minus, Target, Phone, AlertTriangle, Gauge, Fuel, Battery, Thermometer, Droplets
} from 'lucide-react';
import MAAChatBot from './components/ChatBot';
import { generatePromoVideo } from './services/gemini';
import { FeatureCategory, ProjectFeature, StatItem, TimelineStage } from './types';

// --- DATA CONSTANTS ---

const FEATURES: ProjectFeature[] = [
  {
    id: '1',
    title: 'Drone Auto-Rescue',
    description: 'Autonomous deployment to accident sites with medical supplies and live surveillance feed.',
    iconName: 'Zap',
    category: FeatureCategory.FUTURE
  },
  {
    id: '2',
    title: 'Satellite Uplink',
    description: 'Uninterruptible connectivity via dedicated satellite chips for remote area coverage.',
    iconName: 'Globe',
    category: FeatureCategory.HARDWARE
  },
  {
    id: '3',
    title: 'Vital Tracking V2',
    description: 'Advanced biometric monitoring for heart rate and shock detection during emergencies.',
    iconName: 'HeartPulse',
    category: FeatureCategory.CORE
  },
  {
    id: '4',
    title: 'Offline LoRaWAN',
    description: 'Deep-range radio protocols ensuring signal transmission in zero-network zones.',
    iconName: 'Wifi',
    category: FeatureCategory.HARDWARE
  },
  {
    id: '5',
    title: 'AI Predictive Suite',
    description: 'Real-time analysis of environmental factors to preemptively avoid collisions.',
    iconName: 'Cpu',
    category: FeatureCategory.CORE
  },
  {
    id: '6',
    title: 'BlackBox Cloud',
    description: 'Immutable, encrypted data logging for post-incident forensic analysis.',
    iconName: 'Database',
    category: FeatureCategory.FUTURE
  },
  {
    id: '7',
    title: 'Global ID',
    description: 'Universal NFC identity system for immediate first-responder medical access.',
    iconName: 'Shield',
    category: FeatureCategory.CORE
  },
  {
    id: '8',
    title: 'MAA Smart-App',
    description: 'Family dashboard for live tracking, vehicle diagnostics (Fuel, TPMS, Engine), and emergency management.',
    iconName: 'Smartphone',
    category: FeatureCategory.CORE
  }
];

const STATS: StatItem[] = [
  { value: '< 05s', label: 'Response Latency', subtext: 'Instant Activation' },
  { value: '100%', label: 'Commitment', subtext: 'To Human Life' },
  { value: '04m', label: 'Global Frequency', subtext: 'Accident Rate' },
  { value: '24/7', label: 'Surveillance', subtext: 'Satellite Link' },
];

const TIMELINE: TimelineStage[] = [
  { stage: 'Phase I', title: 'Inception', description: 'Conceptual framework and rigorous market gap analysis.', completed: true },
  { stage: 'Phase II', title: 'Prototyping', description: 'Functional model integrated with GPS, shock sensors, and GSM.', completed: true },
  { stage: 'Phase III', title: 'Pilot Testing', description: 'Controlled urban deployment with a fleet of 50 beta vehicles.', completed: false },
  { stage: 'Phase IV', title: 'Global Scale', description: 'Mass manufacturing and satellite network integration.', completed: false },
];

// --- COMPONENTS ---

const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="text-slate-400 hover:text-white transition-colors text-xs font-medium uppercase tracking-[0.2em]"
  >
    {children}
  </a>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-16 text-center">
    <span className="block text-slate-500 text-xs uppercase tracking-[0.3em] mb-3">The Technology</span>
    <h2 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">
      {title}
    </h2>
    <div className="w-24 h-[1px] bg-slate-700 mx-auto mb-6"></div>
    {subtitle && <p className="text-slate-400 max-w-2xl mx-auto font-light leading-relaxed text-lg">{subtitle}</p>}
  </div>
);

const FeatureCard = ({ feature }: { feature: ProjectFeature }) => {
  const icons: Record<string, React.ElementType> = {
    Zap, Globe, HeartPulse, Wifi, Cpu, Database, Shield, Smartphone
  };
  const Icon = icons[feature.iconName] || Activity;
  
  const [isCalling, setIsCalling] = useState(false);

  const handleSOS = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
      window.location.href = 'tel:8092713900';
    }, 1500);
  };

  return (
    <div className="glass-card p-8 rounded-none border border-white/5 hover:border-slate-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-slate-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
      
      <div className="w-12 h-12 flex items-center justify-center mb-6 text-slate-400 group-hover:text-white transition-colors">
        <Icon size={28} strokeWidth={1} />
      </div>
      
      <h3 className="text-xl text-white mb-3 font-serif tracking-wide">{feature.title}</h3>
      <p className="text-slate-500 text-sm leading-loose group-hover:text-slate-400 transition-colors mb-4">{feature.description}</p>
      
      {feature.id === '8' && (
        <button 
          onClick={handleSOS}
          disabled={isCalling}
          className={`mt-auto w-full py-3 border text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition-all ${isCalling ? 'bg-red-600 border-red-600 text-white' : 'border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white'}`}
        >
          {isCalling ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
          {isCalling ? 'DIALING EMERGENCY...' : 'SIMULATE SOS CALL'}
        </button>
      )}
      
      <div className={`mt-6 flex items-center gap-2 ${feature.id === '8' ? 'mt-4' : ''}`}>
        <span className="text-[10px] uppercase tracking-widest text-slate-600">{feature.category}</span>
        <div className="h-[1px] flex-1 bg-slate-800"></div>
      </div>
    </div>
  );
};

const VideoModal = ({ isOpen, onClose, videoId, videoUrl, driveId }: { isOpen: boolean; onClose: () => void; videoId?: string; videoUrl?: string | null; driveId?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-sm border border-slate-800 overflow-hidden shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <X size={24} strokeWidth={1} />
        </button>
        
        {videoUrl ? (
          <video 
            className="w-full h-full"
            src={videoUrl}
            controls
            autoPlay
          />
        ) : driveId ? (
          <iframe 
            className="w-full h-full"
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        ) : videoId ? (
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0`} 
            title="MAA Demo Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 font-serif italic">Video Signal Offline</div>
        )}
      </div>
    </div>
  );
};

interface TrackingEntity {
  id: string;
  name: string;
  owner: string;
  type: 'vehicle' | 'wearable';
  x: number;
  y: number;
  data: string;
  status: string;
  color: string;
  fuel?: number;
  tirePressure?: number;
  battery?: number;
  engineTemp?: number;
  oilLife?: number;
}

const LiveTrackingSection = () => {
  const [selectedId, setSelectedId] = useState<string>('v1');
  const [zoom, setZoom] = useState(1);
  const [entities, setEntities] = useState<TrackingEntity[]>([
    { 
      id: 'v1', 
      name: 'Vehicle 01', 
      owner: 'Dad', 
      type: 'vehicle', 
      x: 42, 
      y: 38, 
      data: '65 km/h', 
      status: 'Northbound', 
      color: 'emerald',
      fuel: 18,
      tirePressure: 32,
      engineTemp: 92,
      oilLife: 68
    },
    { 
      id: 'w1', 
      name: 'Wearable 04', 
      owner: 'Mom', 
      type: 'wearable', 
      x: 68, 
      y: 55, 
      data: '72 BPM', 
      status: 'Stationary', 
      color: 'amber',
      battery: 84
    }
  ]);

  // Simulate Real-time Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEntities(prev => prev.map(entity => {
        if (entity.type === 'vehicle') {
          // Random walk simulation
          const deltaX = (Math.random() - 0.5) * 4;
          const deltaY = (Math.random() - 0.5) * 4;
          const newX = Math.max(10, Math.min(90, entity.x + deltaX));
          const newY = Math.max(10, Math.min(90, entity.y + deltaY));
          const speed = Math.floor(60 + Math.random() * 10);
          
          // Engine fluctuation
          const newTemp = Math.max(85, Math.min(105, (entity.engineTemp || 90) + (Math.random() - 0.5) * 2));

          return { ...entity, x: newX, y: newY, data: `${speed} km/h`, engineTemp: Math.floor(newTemp) };
        } else {
          // Heartbeat simulation
          const bpm = Math.floor(70 + Math.random() * 5);
          
          // Battery drain simulation
          const currentBattery = entity.battery || 100;
          let newBattery = currentBattery - 0.2; // Slow drain
          if (newBattery < 0) newBattery = 100; // Reset for demo
          
          return { ...entity, data: `${bpm} BPM`, battery: newBattery };
        }
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const selectedEntity = entities.find(e => e.id === selectedId);
  
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));

  return (
    <section className="py-32 bg-white/[0.02] border-t border-white/5">
      <div className="container mx-auto px-8">
        <div className="flex flex-col items-center mb-16">
          <span className="text-xs text-emerald-500 uppercase tracking-[0.3em] mb-3 animate-pulse">● Live System Feed</span>
          <h2 className="text-4xl font-serif text-white text-center">Real-Time Global Monitoring</h2>
        </div>

        <div className="relative w-full max-w-6xl mx-auto h-[600px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative group">
          
          {/* Zoomable Container */}
          <div 
            className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Map Background */}
            <div className="absolute inset-0 opacity-30 transition-opacity duration-700 group-hover:opacity-50 pointer-events-none">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
                className="w-full h-full object-cover grayscale invert" 
                alt="Global Map Data" 
              />
            </div>
            
            {/* Map Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {/* Floating Map Markers */}
            {entities.map((entity) => {
              const isSelected = selectedId === entity.id;
              const hasWarning = (entity.fuel && entity.fuel < 20) || (entity.battery && entity.battery < 20);
              
              // Determine Color Logic
              let colorClass = entity.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500';
              let borderClass = entity.color === 'emerald' ? 'border-emerald-500' : 'border-amber-500';
              let bgClass = entity.color === 'emerald' ? 'bg-emerald-400' : 'bg-amber-400';

              if (hasWarning) {
                borderClass = 'border-red-500';
                bgClass = 'bg-red-500';
                colorClass = 'text-red-500';
              }

              return (
                <div 
                  key={entity.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group/marker z-10 transition-all duration-[2000ms] ease-linear"
                  style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
                  onClick={() => setSelectedId(entity.id)}
                >
                  <div className="relative transition-transform duration-500" style={{ transform: `scale(${1/zoom})` }}>
                    {/* Pulsing Ring */}
                    <div className={`w-24 h-24 border rounded-full absolute inset-0 -m-8 opacity-20 ${hasWarning ? 'animate-[ping_1s_linear_infinite] border-red-500' : `animate-[ping_3s_linear_infinite] ${borderClass}`}`}></div>
                    
                    {/* Core Dot */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-300 ${isSelected ? 'scale-110 bg-white/10' : 'bg-black/20'} ${hasWarning ? 'border-red-500/50' : `${borderClass}/50`}`}>
                      <div className={`w-2 h-2 rounded-full shadow-[0_0_10px] ${bgClass} ${hasWarning ? 'shadow-red-500' : ''}`}></div>
                    </div>

                    {/* Tooltip - Always visible if selected, else on hover */}
                    <div className={`absolute left-10 top-0 bg-slate-900/90 text-white p-3 rounded border min-w-[140px] transition-all duration-300 ${isSelected ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible -translate-x-2 group-hover/marker:opacity-100 group-hover/marker:visible group-hover/marker:translate-x-0'} ${hasWarning ? 'border-red-500/30' : `${borderClass}/30`}`}>
                        <div className={`text-xs font-bold mb-1 ${hasWarning ? 'text-red-400' : (entity.color === 'emerald' ? 'text-emerald-400' : 'text-amber-400')}`}>
                          {entity.name.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-slate-300">Lat: 34.{Math.floor(entity.x * 100)} N</div>
                        <div className="text-[10px] text-slate-300">Lng: 118.{Math.floor(entity.y * 100)} W</div>
                        
                        {/* Mini Status Bar in Tooltip */}
                        {entity.type === 'vehicle' && (
                          <div className="mt-2 h-0.5 w-full bg-slate-700 overflow-hidden rounded-full">
                            <div className={`h-full w-3/4 ${hasWarning ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          </div>
                        )}
                        {hasWarning && (
                           <div className="mt-1 text-[9px] text-red-400 font-bold animate-pulse">⚠ ALERT ACTIVE</div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
            <button 
              onClick={handleZoomIn}
              className="p-3 bg-slate-900/80 backdrop-blur border border-white/10 text-white rounded hover:bg-slate-800 transition-colors"
            >
              <Plus size={16}/>
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-3 bg-slate-900/80 backdrop-blur border border-white/10 text-white rounded hover:bg-slate-800 transition-colors"
            >
              <Minus size={16}/>
            </button>
            <button 
              className="p-3 bg-slate-900/80 backdrop-blur border border-white/10 text-emerald-400 rounded hover:bg-slate-800 mt-2 transition-colors"
              onClick={() => { setSelectedId('v1'); setZoom(1); }}
            >
              <Target size={16}/>
            </button>
          </div>

          {/* Dashboard Interface - Sidebar */}
          <div className="absolute left-4 top-4 bottom-4 w-80 glass-panel rounded-lg p-6 flex flex-col gap-4 backdrop-blur-xl border-r border-white/5 z-30 overflow-y-auto">
            <div className="flex items-center gap-2 text-white mb-4 border-b border-white/10 pb-4">
              <Activity size={16} className="text-emerald-400" />
              <span className="text-xs font-serif tracking-widest">ACTIVE ENTITIES</span>
            </div>

            {entities.map((entity) => (
              <div 
                key={entity.id}
                onClick={() => setSelectedId(entity.id)}
                className={`p-3 rounded border transition-all cursor-pointer group/card ${selectedId === entity.id ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{entity.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px] ${entity.fuel && entity.fuel < 20 ? 'bg-red-500 shadow-red-500 animate-pulse' : (entity.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500' : 'bg-amber-500 shadow-amber-500')}`}></span>
                </div>
                <div className="text-sm font-serif text-white">{entity.type === 'vehicle' ? `Tesla - ${entity.owner}` : `Band - ${entity.owner}`}</div>
                <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    {entity.type === 'vehicle' ? <Navigation size={10} /> : <HeartPulse size={10} />} 
                    {entity.data}
                  </span>
                  <span>{entity.status}</span>
                </div>
              </div>
            ))}

            {selectedEntity && selectedEntity.type === 'vehicle' && (
              <div className="mt-2 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-left-4 duration-500 space-y-3">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest">
                  <AlertTriangle size={10} className="text-amber-500" /> Vehicle Safety
                </div>
                
                {/* Fuel Diagnostic */}
                <div className="bg-black/20 p-3 rounded border border-white/5">
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Fuel size={12} className="text-slate-500" /> 
                      <span>Fuel Level</span>
                    </div>
                    <span className={selectedEntity.fuel! < 20 ? "text-amber-500 font-bold" : "text-emerald-500"}>
                      {selectedEntity.fuel}% {selectedEntity.fuel! < 20 && "(!)"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${selectedEntity.fuel! < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                       style={{ width: `${selectedEntity.fuel}%` }}
                     ></div>
                  </div>
                </div>

                {/* Tire Pressure Diagnostic */}
                <div className="bg-black/20 p-3 rounded border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Gauge size={12} className="text-slate-500" />
                        <span>Tire Pressure</span>
                      </div>
                      <span className="text-xs text-emerald-400">{selectedEntity.tirePressure} PSI</span>
                   </div>
                   <div className="grid grid-cols-4 gap-1 mt-2">
                      {[1,2,3,4].map(t => (
                        <div key={t} className="h-1 bg-emerald-500/50 rounded-full"></div>
                      ))}
                   </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest pt-2">
                  <Cpu size={10} className="text-sky-500" /> Mechanical Status
                </div>

                 {/* Engine Temp */}
                 <div className="bg-black/20 p-3 rounded border border-white/5">
                   <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Thermometer size={12} className="text-slate-500" />
                        <span>Engine Temp</span>
                      </div>
                      <span className={`text-xs ${selectedEntity.engineTemp! > 100 ? 'text-red-500 font-bold' : 'text-emerald-400'}`}>
                        {selectedEntity.engineTemp}°C
                      </span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${selectedEntity.engineTemp! > 100 ? 'bg-red-500' : 'bg-sky-500'}`} 
                       style={{ width: `${Math.min(100, (selectedEntity.engineTemp! / 120) * 100)}%` }}
                     ></div>
                  </div>
                </div>

                {/* Oil Life */}
                <div className="bg-black/20 p-3 rounded border border-white/5">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <Droplets size={12} className="text-slate-500" />
                        <span>Oil Life</span>
                      </div>
                      <span className="text-xs text-slate-400">{selectedEntity.oilLife}%</span>
                   </div>
                </div>

              </div>
            )}

            {selectedEntity && selectedEntity.type === 'wearable' && (
              <div className="mt-2 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest mb-4">
                  <Battery size={10} className={selectedEntity.battery! < 20 ? "text-red-500" : "text-slate-500"} /> Device Status
                </div>
                
                {/* Battery Diagnostic */}
                <div className="mb-4 bg-black/20 p-3 rounded border border-white/5">
                  <div className="flex justify-between text-xs text-slate-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Battery size={12} className="text-slate-500" /> 
                      <span>Battery Level</span>
                    </div>
                    <span className={selectedEntity.battery! < 20 ? "text-red-500 font-bold" : "text-emerald-500"}>
                      {Math.floor(selectedEntity.battery!)}% {selectedEntity.battery! < 20 && "(!)"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className={`h-full rounded-full transition-all duration-1000 ${selectedEntity.battery! < 20 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                       style={{ width: `${selectedEntity.battery}%` }}
                     ></div>
                  </div>
                  {selectedEntity.battery! < 20 && (
                    <div className="mt-2 text-[9px] text-red-500/80 flex items-center gap-1 animate-pulse">
                      <AlertTriangle size={8} /> CRITICAL BATTERY
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-auto pt-4">
               <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">System Status</div>
               <div className="flex items-center gap-2 text-xs text-emerald-400">
                 <CheckCircle2 size={12} /> All Systems Nominal
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Video Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [youtubeId, setYoutubeId] = useState<string | undefined>(undefined);
  const [driveId, setDriveId] = useState<string | undefined>(undefined);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // Promo Generation State
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMainDemo = () => {
    setGeneratedVideoUrl(null);
    setYoutubeId(undefined);
    setDriveId("14nkPOJgIMmHZJkBPoR7WdkbZx6OI6jJ-");
    setIsModalOpen(true);
  };

  const handleGeneratePromo = async () => {
    if (isGenerating) return;

    try {
      // @ts-ignore
      if (window.aistudio) {
         // @ts-ignore
         const hasKey = await window.aistudio.hasSelectedApiKey();
         if (!hasKey) {
           // @ts-ignore
           await window.aistudio.openSelectKey();
         }
      }

      setIsGenerating(true);
      const url = await generatePromoVideo();
      
      if (url) {
        setYoutubeId(undefined);
        setDriveId(undefined);
        setGeneratedVideoUrl(url);
        setIsModalOpen(true);
      } else {
        alert("Generation unavailable at this moment.");
      }
    } catch (error: any) {
      console.error("Generation failed", error);
      
      // Robust error message parsing
      const errorMessage = error?.message || error?.error?.message || JSON.stringify(error);
      
      if (errorMessage.includes("Requested entity was not found")) {
         // @ts-ignore
         if (window.aistudio) {
            // @ts-ignore
            await window.aistudio.openSelectKey();
         }
      } else {
        alert("Generation failed. Please verify credentials.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-200 selection:bg-slate-700 selection:text-white">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-white/20 flex items-center justify-center rounded-sm">
               <Shield className="text-slate-100" size={16} strokeWidth={1.5} />
            </div>
            <span className="text-lg font-serif tracking-widest text-white">MAA</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <NavLink href="#mission">Mission</NavLink>
            <NavLink href="#tech">Technology</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#timeline">Roadmap</NavLink>
            <a href="#contact" className="text-xs uppercase tracking-widest px-6 py-3 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300">
              Contact
            </a>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} strokeWidth={1} /> : <Menu size={24} strokeWidth={1} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-slate-950 border-b border-white/10 p-8 flex flex-col gap-6 md:hidden">
            <NavLink href="#mission" onClick={() => setIsMobileMenuOpen(false)}>Mission</NavLink>
            <NavLink href="#tech" onClick={() => setIsMobileMenuOpen(false)}>Technology</NavLink>
            <NavLink href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</NavLink>
            <NavLink href="#timeline" onClick={() => setIsMobileMenuOpen(false)}>Roadmap</NavLink>
            <NavLink href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</NavLink>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
           <div className="absolute top-0 right-0 w-[50vw] h-screen bg-gradient-to-l from-slate-900 to-transparent opacity-40"></div>
           <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-slate-950 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-8 relative z-10 pointer-events-none">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                System Operational
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight text-white mb-8">
              <span className="relative z-30 inline-block">
                 <span className="text-classic-gold">Every Life Matters.</span>
              </span>
              <br />
              <span className="relative z-30 inline-block">
                 <span className="text-classic-gold italic opacity-80">Every Second Counts.</span>
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12 font-light">
              A harmonious integration of satellite telemetry, autonomous robotics, and artificial intelligence. Designed for the sanctity of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center relative z-30 pointer-events-auto">
              <button 
                onClick={openMainDemo}
                className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors flex items-center justify-center gap-3 min-w-[200px] relative z-30"
              >
                <Play size={16} />
                Watch Demo
              </button>
              
              <button 
                onClick={handleGeneratePromo}
                disabled={isGenerating}
                className="px-8 py-4 bg-transparent border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:border-white hover:bg-white/5 transition-all flex items-center justify-center gap-3 min-w-[200px] disabled:opacity-50 relative z-30"
              >
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Film size={16} />
                )}
                {isGenerating ? 'Rendering...' : 'Generate AI Promo'}
              </button>
            </div>

            {/* Abstract Car Visualization */}
            <div className="mt-20 relative w-full max-w-2xl aspect-[2/1] opacity-80 pointer-events-none">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-20"></div>
               <img 
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000" 
                  alt="Classic Automotive Tech" 
                  className="w-full h-full object-cover rounded-sm grayscale mix-blend-overlay opacity-60"
               />
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="text-4xl md:text-5xl font-serif text-white mb-3 group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</div>
                <div className="h-px w-8 bg-slate-700 mx-auto group-hover:w-16 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-32 relative">
        <div className="container mx-auto px-8">
          <SectionTitle title="The Mission" subtitle="To engineer an unbreakable safety net through the convergence of three technological pillars." />
          
          <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="bg-slate-950 p-12 text-center group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 mx-auto mb-8 text-slate-300 group-hover:text-white transition-colors">
                <Cpu size={64} strokeWidth={0.5} />
              </div>
              <h3 className="text-xl text-white mb-4 font-serif">Artificial Intelligence</h3>
              <p className="text-slate-500 text-sm leading-loose">Predictive algorithms that transition safety from reactive to proactive.</p>
            </div>

            <div className="bg-slate-950 p-12 text-center group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 mx-auto mb-8 text-slate-300 group-hover:text-white transition-colors">
                <Radio size={64} strokeWidth={0.5} />
              </div>
              <h3 className="text-xl text-white mb-4 font-serif">IoT Connectivity</h3>
              <p className="text-slate-500 text-sm leading-loose">Seamless integration across vehicles, infrastructure, and wearables.</p>
            </div>

            <div className="bg-slate-950 p-12 text-center group hover:bg-slate-900 transition-colors duration-500">
              <div className="w-16 h-16 mx-auto mb-8 text-slate-300 group-hover:text-white transition-colors">
                <MapPin size={64} strokeWidth={0.5} />
              </div>
              <h3 className="text-xl text-white mb-4 font-serif">Satellite Tracking</h3>
              <p className="text-slate-500 text-sm leading-loose">GLONASS & NavIC integration ensures global visibility without exception.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-32 bg-white/[0.02]">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center gap-20">
             <div className="w-full md:w-1/2 relative">
               <div className="absolute inset-0 border border-white/20 translate-x-4 translate-y-4"></div>
               <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" 
                alt="Satellite Technology" 
                className="relative w-full grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl"
               />
             </div>
             <div className="w-full md:w-1/2 space-y-10">
               <div>
                  <span className="text-xs text-slate-500 uppercase tracking-[0.2em]">Engineering</span>
                  <h2 className="text-4xl font-serif text-white mt-4">Precision Engineering</h2>
               </div>
               
               <p className="text-slate-400 font-light leading-relaxed text-lg">
                 Constructed with military-grade specifications using the foremost sensor technology and communication protocols available today.
               </p>
               
               <div className="space-y-6">
                 {[
                   "Multi-Constellation GNSS (GPS + NavIC)",
                   "6-Axis Gyroscope & Accelerometers",
                   "Thermal Imaging & Night Vision",
                   "LoRaWAN Long Range Radio",
                   "Edge AI Computing"
                 ].map((item, i) => (
                   <div key={i} className="flex items-center gap-6 group">
                     <div className="w-2 h-2 bg-slate-700 group-hover:bg-white transition-colors rounded-full"></div>
                     <span className="text-slate-300 font-light tracking-wide">{item}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="container mx-auto px-8">
          <SectionTitle title="The Ecosystem" subtitle="A comprehensive suite of protective measures designed for every contingency." />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Live Tracking Demo */}
      <LiveTrackingSection />

      {/* Timeline Section */}
      <section id="timeline" className="py-32 bg-white/[0.02]">
        <div className="container mx-auto px-8">
          <SectionTitle title="The Roadmap" />
          
          <div className="max-w-5xl mx-auto mt-16">
            {TIMELINE.map((item, index) => (
              <div key={index} className="group flex gap-12 pb-16 relative last:pb-0">
                {/* Line */}
                {index !== TIMELINE.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-slate-800"></div>
                )}
                
                {/* Marker */}
                <div className={`relative z-10 w-10 h-10 border border-slate-700 flex items-center justify-center shrink-0 bg-slate-950 group-hover:border-white transition-colors`}>
                  <div className={`w-2 h-2 ${item.completed ? 'bg-white' : 'bg-slate-800'}`}></div>
                </div>
                
                {/* Content */}
                <div className={`pt-1 ${item.completed ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex items-baseline gap-4 mb-2">
                    <span className="text-xs text-slate-500 uppercase tracking-widest">{item.stage}</span>
                    <h3 className="text-2xl font-serif text-white">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 font-light">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32">
        <div className="container mx-auto px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-serif text-white mb-6">Begin the Conversation</h2>
            <p className="text-slate-400 font-light">Partnerships, investment, and innovation inquiries.</p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-8">
                 <div className="group">
                   <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 group-focus-within:text-white transition-colors">Name</label>
                   <input type="text" className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:outline-none focus:border-white transition-colors" />
                 </div>
                 <div className="group">
                   <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 group-focus-within:text-white transition-colors">Email</label>
                   <input type="email" className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:outline-none focus:border-white transition-colors" />
                 </div>
              </div>
              <div className="group">
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3 group-focus-within:text-white transition-colors">Message</label>
                <textarea rows={4} className="w-full bg-transparent border-b border-slate-700 py-2 text-white focus:outline-none focus:border-white transition-colors"></textarea>
              </div>
              <div className="text-center pt-8">
                <button type="submit" className="px-10 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
                  Send Inquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-slate-950">
        <div className="container mx-auto px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="text-slate-400" size={20} strokeWidth={1} />
            <span className="text-lg font-serif text-white tracking-widest">MAA</span>
          </div>
          <p className="text-slate-600 text-xs uppercase tracking-widest mb-8">
            Mindful Auto Alert © {new Date().getFullYear()}
          </p>
          <div className="flex justify-center gap-8 text-xs text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Legal</a>
          </div>
        </div>
      </footer>

      {/* Modals & Chat */}
      <VideoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        videoId={youtubeId}
        videoUrl={generatedVideoUrl}
        driveId={driveId}
      />
      <MAAChatBot />

    </div>
  );
}

export default App;