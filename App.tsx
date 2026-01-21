
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PhotoSession } from './types';
import Calendar from './components/Calendar';
import SessionCard from './components/SessionCard';
import SessionModal from './components/SessionModal';
import { supabaseService, getSupabaseClient } from './services/supabase';
import { Plus, Camera, Layers, LayoutDashboard, Download, Upload, Info, Cloud, CloudOff, AlertTriangle, Settings, Database } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'error' | 'disconnected'>('disconnected');
  
  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('supabase_url') || '',
    key: localStorage.getItem('supabase_key') || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatDisplayDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  const loadData = async () => {
    setIsLoading(true);
    const client = getSupabaseClient();
    
    if (client) {
      try {
        const cloudSessions = await supabaseService.getSessions();
        if (cloudSessions) {
          setSessions(cloudSessions);
          setCloudStatus('connected');
          setIsLoading(false);
          return;
        } else {
          setCloudStatus('error');
        }
      } catch (error) {
        setCloudStatus('error');
      }
    } else {
      setCloudStatus('disconnected');
    }
    
    const saved = localStorage.getItem('lenslink_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local sessions", e);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('lenslink_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleSaveSession = async (session: PhotoSession) => {
    if (cloudStatus === 'connected') {
      await supabaseService.saveSession(session);
    }
    setSessions(prev => [session, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsModalOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      if (cloudStatus === 'connected') {
        await supabaseService.deleteSession(id);
      }
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const saveDbConfig = () => {
    localStorage.setItem('supabase_url', dbConfig.url.trim());
    localStorage.setItem('supabase_key', dbConfig.key.trim());
    setIsConfigOpen(false);
    // Forzamos recarga para re-instanciar el cliente de Supabase
    window.location.reload();
  };

  const filteredSessions = useMemo(() => {
    if (activeTab === 'calendar') {
      return sessions.filter(s => s.date === selectedDate);
    }
    return sessions;
  }, [sessions, selectedDate, activeTab]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-20 lg:w-24 bg-black text-white flex flex-col items-center py-8 gap-10 md:sticky md:top-0 md:h-screen z-40">
        <Camera size={40} className="text-yellow-400" strokeWidth={2.5} />
        
        <nav className="flex flex-row md:flex-col gap-6 md:gap-8 flex-1">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-yellow-400 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`p-3 rounded-xl transition-all ${activeTab === 'list' ? 'bg-yellow-400 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            <Layers size={24} />
          </button>
        </nav>

        <div className="hidden md:flex flex-col gap-4 items-center">
          <button 
            onClick={() => setIsConfigOpen(true)}
            className={`p-2 rounded-full transition-colors ${
              cloudStatus === 'connected' ? 'text-green-400' : 
              cloudStatus === 'error' ? 'text-red-500 animate-pulse' : 
              'text-neutral-600'
            }`}
          >
            {cloudStatus === 'connected' ? <Cloud size={24} /> : <CloudOff size={24} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-2 text-black">
              Colabos con <span className="text-yellow-400">Manolakos</span>
            </h1>
            <p className="text-neutral-400 font-medium uppercase tracking-[0.2em] text-xs">Agenda de colaboraciones creativas</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group relative flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
            >
              <Plus size={20} />
              Nueva Sesión
            </button>
          </div>
        </header>

        {cloudStatus !== 'connected' && (
          <div className="bg-white border-2 border-black p-4 mb-8 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-500" />
              <p className="text-xs font-bold uppercase">Modo Local Activo - No se sincronizará entre dispositivos</p>
            </div>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Configurar Base de Datos
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase text-xs tracking-widest">Sincronizando equipo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              {activeTab === 'calendar' ? (
                <Calendar sessions={sessions} selectedDate={selectedDate} onDateClick={setSelectedDate} />
              ) : (
                <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Timeline de Colaboraciones</h2>
                  <div className="flex gap-10">
                    <div>
                      <span className="block text-4xl font-black text-black">{sessions.length}</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Sesiones Totales</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
                {activeTab === 'calendar' ? `Sesiones (${formatDisplayDate(selectedDate)})` : 'Próximas Sesiones'}
              </h2>
              <div className="space-y-6">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map(session => <SessionCard key={session.id} session={session} onDelete={handleDeleteSession} />)
                ) : (
                  <div className="border-2 border-dashed border-neutral-300 p-12 text-center bg-white/50">
                    <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No hay sesiones</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Configuración DB */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border-4 border-black w-full max-w-md p-8 shadow-[10px_10px_0px_0px_rgba(250,204,21,1)]">
            <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-2">
              <Database className="text-yellow-400" /> Configurar Sincronización
            </h2>
            <p className="text-xs text-neutral-500 mb-6 font-medium">Configura Supabase para ver tus sesiones en cualquier dispositivo.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Supabase Project URL</label>
                <input 
                  className="w-full border-2 border-black p-3 text-xs outline-none focus:bg-yellow-50"
                  placeholder="https://xyz.supabase.co"
                  value={dbConfig.url}
                  onChange={e => setDbConfig({...dbConfig, url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Anon API Key</label>
                <input 
                  className="w-full border-2 border-black p-3 text-xs outline-none focus:bg-yellow-50"
                  placeholder="eyJhbG..."
                  value={dbConfig.key}
                  onChange={e => setDbConfig({...dbConfig, key: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={saveDbConfig}
                className="flex-1 bg-black text-white p-3 font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors"
              >
                Guardar y Conectar
              </button>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="px-6 border-2 border-black font-black uppercase text-xs hover:bg-neutral-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <SessionModal onClose={() => setIsModalOpen(false)} onSave={handleSaveSession} initialDate={selectedDate} />
      )}
    </div>
  );
};

export default App;
