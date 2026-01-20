
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PhotoSession } from './types';
import Calendar from './components/Calendar';
import SessionCard from './components/SessionCard';
import SessionModal from './components/SessionModal';
import { Plus, Camera, Layers, LayoutDashboard, Download, Upload, Info } from 'lucide-react';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<PhotoSession[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lenslink_sessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    localStorage.setItem('lenslink_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleSaveSession = (session: PhotoSession) => {
    setSessions(prev => [session, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsModalOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `colabos_manolakos_backup_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    fileReader.readAsText(files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (Array.isArray(content)) {
          if (confirm('¿Deseas importar estas sesiones? Esto reemplazará tu lista actual.')) {
            setSessions(content);
          }
        }
      } catch (err) {
        alert('El archivo no es válido.');
      }
    };
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
            title="Calendario"
            className={`p-3 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-yellow-400 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            <LayoutDashboard size={24} />
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            title="Timeline"
            className={`p-3 rounded-xl transition-all ${activeTab === 'list' ? 'bg-yellow-400 text-black' : 'text-neutral-500 hover:text-white'}`}
          >
            <Layers size={24} />
          </button>
        </nav>

        <div className="hidden md:flex flex-col gap-4 items-center">
          <button 
            onClick={() => alert('Modo Offline Activo: Tus datos se guardan en este navegador. Usa el botón de Exportar para copias de seguridad.')}
            className="text-neutral-600 hover:text-white transition-colors"
          >
            <Info size={20} />
          </button>
          <div className="w-10 h-10 bg-neutral-800 rounded-full border border-neutral-700"></div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-16 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-2 text-black">
              Colabos con <span className="text-yellow-400">Manolakos</span>
            </h1>
            <p className="text-neutral-400 font-medium uppercase tracking-[0.2em] text-xs">Agendamiento Creativo Colaborativo</p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center gap-2 bg-black text-white px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(250,204,21,1)]"
          >
            <Plus size={20} />
            Nueva Sesión
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-2 border-2 border-black inline-flex gap-1 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <button 
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-1 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'calendar' ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
              >
                Calendario
              </button>
              <button 
                onClick={() => setActiveTab('list')}
                className={`px-4 py-1 text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'list' ? 'bg-black text-white' : 'hover:bg-neutral-100'}`}
              >
                Todas las Sesiones
              </button>
            </div>

            {activeTab === 'calendar' ? (
              <Calendar 
                sessions={sessions}
                selectedDate={selectedDate}
                onDateClick={setSelectedDate}
              />
            ) : (
              <div className="bg-white border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Resumen General</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportData}
                      title="Exportar copia de seguridad"
                      className="p-2 border-2 border-black hover:bg-yellow-400 transition-colors text-black"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      title="Importar copia de seguridad"
                      className="p-2 border-2 border-black hover:bg-yellow-400 transition-colors text-black"
                    >
                      <Upload size={18} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".json" 
                      onChange={importData} 
                    />
                  </div>
                </div>
                <div className="flex gap-10">
                  <div>
                    <span className="block text-4xl font-black text-black">{sessions.length}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Sesiones Totales</span>
                  </div>
                  <div>
                    <span className="block text-4xl font-black text-black">{sessions.filter(s => new Date(s.date) > new Date()).length}</span>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Pendientes</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
                {activeTab === 'calendar' ? `Sesiones (${selectedDate})` : 'Timeline de Colaboraciones'}
              </h2>
              {activeTab === 'calendar' && filteredSessions.length > 0 && (
                <span className="bg-yellow-400 px-2 py-1 text-[10px] font-black border border-black uppercase text-black">
                  {filteredSessions.length} Activas
                </span>
              )}
            </div>

            <div className="space-y-6">
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onDelete={handleDeleteSession}
                  />
                ))
              ) : (
                <div className="border-2 border-dashed border-neutral-300 p-12 text-center bg-white/50">
                  <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest mb-4">No hay sesiones para esta fecha</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-black uppercase border-b-2 border-yellow-400 pb-1 text-black hover:text-yellow-600 transition-colors"
                  >
                    + Agendar ahora
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <SessionModal 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveSession}
          initialDate={selectedDate}
        />
      )}

      <div className="fixed bottom-10 right-10 pointer-events-none opacity-20 hidden lg:block">
        <span className="text-9xl font-black uppercase text-neutral-300 rotate-90 origin-bottom-right">2024</span>
      </div>
    </div>
  );
};

export default App;
