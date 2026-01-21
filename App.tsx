
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PhotoSession } from './types';
import Calendar from './components/Calendar';
import SessionCard from './components/SessionCard';
import SessionModal from './components/SessionModal';
import { supabaseService, getSupabaseClient } from './services/supabase';
import { Plus, Camera, Layers, LayoutDashboard, Info, Cloud, CloudOff, AlertTriangle, Database, RefreshCw, ArrowUpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'error' | 'disconnected'>('disconnected');
  const [dbError, setDbError] = useState<string | null>(null);
  
  const [dbConfig, setDbConfig] = useState({
    url: localStorage.getItem('supabase_url') || '',
    key: localStorage.getItem('supabase_key') || ''
  });

  const formatDisplayDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    const client = getSupabaseClient();
    
    if (client) {
      const cloudSessions = await supabaseService.getSessions();
      if (cloudSessions) {
        setSessions(cloudSessions);
        setCloudStatus('connected');
        setDbError(null);
        if (!silent) setIsLoading(false);
        return;
      } else {
        setCloudStatus('error');
      }
    }
    
    const saved = localStorage.getItem('lenslink_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local sessions", e);
      }
    }
    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSession = async (session: PhotoSession) => {
    if (cloudStatus === 'connected') {
      await supabaseService.saveSession(session);
    }
    setSessions(prev => [session, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsModalOpen(false);
  };

  const handleDeleteSession = async (id: string) => {
    if (confirm('¿Eliminar esta sesión de forma permanente?')) {
      if (cloudStatus === 'connected') {
        await supabaseService.deleteSession(id);
      }
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const testAndSaveConfig = async () => {
    if (!dbConfig.url || !dbConfig.key) {
      alert("Por favor completa ambos campos.");
      return;
    }
    setIsTesting(true);
    setDbError(null);
    const result = await supabaseService.testConnection(dbConfig.url.trim(), dbConfig.key.trim());
    
    if (result.success) {
      localStorage.setItem('supabase_url', dbConfig.url.trim());
      localStorage.setItem('supabase_key', dbConfig.key.trim());
      window.location.reload();
    } else {
      setDbError(result.message);
      setIsTesting(false);
    }
  };

  const migrateToCloud = async () => {
    if (cloudStatus !== 'connected') return;
    const localSessions = JSON.parse(localStorage.getItem('lenslink_sessions') || '[]');
    if (localSessions.length === 0) return;

    if (confirm(`¿Subir ${localSessions.length} sesiones locales a la nube?`)) {
      setIsLoading(true);
      for (const session of localSessions) {
        await supabaseService.saveSession(session);
      }
      await loadData();
      alert("Migración completada con éxito.");
    }
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
            onClick={() => loadData(true)}
            className="p-2 text-neutral-500 hover:text-yellow-400 transition-colors"
            title="Sincronizar ahora"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsConfigOpen(true)}
            className={`p-2 rounded-full transition-colors ${
              cloudStatus === 'connected' ? 'text-green-400' : 
              cloudStatus === 'error' ? 'text-red-500 animate-pulse' : 
              'text-neutral-600 hover:text-white'
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
              className="group relative flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              <Plus size={20} />
              Nueva Sesión
            </button>
          </div>
        </header>

        {cloudStatus === 'connected' && localStorage.getItem('lenslink_sessions') && JSON.parse(localStorage.getItem('lenslink_sessions') || '[]').length > 0 && (
          <div className="bg-green-50 border-2 border-green-600 p-4 mb-8 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(22,163,74,1)]">
            <div className="flex items-center gap-3 text-green-800">
              <ArrowUpCircle size={20} />
              <p className="text-xs font-bold uppercase tracking-tight">Tienes sesiones guardadas solo en este dispositivo.</p>
            </div>
            <button 
              onClick={migrateToCloud}
              className="bg-green-600 text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-black transition-colors"
            >
              Subir a la nube
            </button>
          </div>
        )}

        {cloudStatus !== 'connected' && (
          <div className="bg-white border-2 border-black p-4 mb-8 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-500" />
              <p className="text-xs font-bold uppercase">Modo Local Activo</p>
            </div>
            <button 
              onClick={() => setIsConfigOpen(true)}
              className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Conectar Base de Datos
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="font-black uppercase text-[10px] tracking-widest">Accediendo a la nube...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-2 mb-4">
                <button 
                  onClick={() => setActiveTab('calendar')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black transition-all ${activeTab === 'calendar' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]' : 'bg-white text-black'}`}
                >
                  Calendario
                </button>
                <button 
                  onClick={() => setActiveTab('list')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-black transition-all ${activeTab === 'list' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]' : 'bg-white text-black'}`}
                >
                  Lista Completa
                </button>
              </div>

              {activeTab === 'calendar' ? (
                <Calendar sessions={sessions} selectedDate={selectedDate} onDateClick={setSelectedDate} />
              ) : (
                <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Colaboraciones</h2>
                    <RefreshCw 
                      size={20} 
                      className={`cursor-pointer ${isLoading ? 'animate-spin text-yellow-500' : 'text-neutral-400 hover:text-black'}`} 
                      onClick={() => loadData(true)}
                    />
                  </div>
                  <div className="flex gap-10">
                    <div className="bg-neutral-50 border-2 border-black p-4 flex-1">
                      <span className="block text-4xl font-black text-black">{sessions.length}</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Sesiones en la nube</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center justify-between">
                <span>{activeTab === 'calendar' ? `Sesiones (${formatDisplayDate(selectedDate)})` : 'Timeline'}</span>
                {cloudStatus === 'connected' && <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 border border-green-600 rounded">LIVE</span>}
              </h2>
              <div className="space-y-6">
                {filteredSessions.length > 0 ? (
                  filteredSessions.map(session => <SessionCard key={session.id} session={session} onDelete={handleDeleteSession} />)
                ) : (
                  <div className="border-2 border-dashed border-neutral-300 p-12 text-center bg-white/50">
                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Sin sesiones programadas</p>
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
            <h2 className="text-2xl font-black uppercase mb-2 flex items-center gap-2 text-black">
              <Database className="text-yellow-400" /> Sincronizar Equipo
            </h2>
            <p className="text-[10px] text-neutral-500 mb-6 font-bold uppercase tracking-tight">Usa las credenciales de tu proyecto de Supabase.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-black">Project URL (Settings > API)</label>
                <input 
                  className="w-full border-2 border-black p-3 text-xs outline-none focus:bg-yellow-50 text-black placeholder:text-neutral-300"
                  placeholder="https://su-proyecto.supabase.co"
                  value={dbConfig.url}
                  onChange={e => setDbConfig({...dbConfig, url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-black">Anon Key (Settings > API)</label>
                <input 
                  className="w-full border-2 border-black p-3 text-xs outline-none focus:bg-yellow-50 text-black placeholder:text-neutral-300"
                  placeholder="eyJhbGci..."
                  value={dbConfig.key}
                  onChange={e => setDbConfig({...dbConfig, key: e.target.value})}
                />
              </div>
            </div>

            {dbError && (
              <div className="bg-red-50 border-2 border-red-500 p-3 mb-6 flex gap-2 text-red-700 items-start">
                <AlertTriangle size={16} className="shrink-0" />
                <p className="text-[10px] font-bold uppercase leading-tight">{dbError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button 
                onClick={testAndSaveConfig}
                disabled={isTesting}
                className="w-full bg-black text-white p-4 font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                {isTesting ? <RefreshCw className="animate-spin" size={16} /> : "Probar y Conectar"}
              </button>
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="w-full border-2 border-black p-3 font-black uppercase text-xs hover:bg-neutral-100 transition-colors text-black"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-100">
              <p className="text-[9px] text-neutral-400 font-bold uppercase">Ayuda: Recuerda ejecutar el script SQL en Supabase para crear la tabla 'sessions' y desactivar RLS.</p>
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
