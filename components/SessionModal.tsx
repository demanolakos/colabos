
import React, { useState } from 'react';
import { PhotoSession, Role, Member } from '../types';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { generateSessionTheme } from '../services/geminiService';

interface SessionModalProps {
  onClose: () => void;
  onSave: (session: PhotoSession) => void;
  initialDate?: string;
}

const SessionModal: React.FC<SessionModalProps> = ({ onClose, onSave, initialDate }) => {
  const [loadingAI, setLoadingAI] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '10:00',
    location: '',
    description: '',
    photographerName: '',
    photographerIG: '',
    modelName: '',
    modelIG: '',
    muaName: '',
    muaIG: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSession: PhotoSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: form.title,
      date: form.date,
      time: form.time,
      location: form.location,
      description: form.description,
      createdAt: Date.now(),
      photographer: { name: form.photographerName, instagram: form.photographerIG, role: Role.PHOTOGRAPHER },
      model: { name: form.modelName, instagram: form.modelIG, role: Role.MODEL },
      mua: { name: form.muaName, instagram: form.muaIG, role: Role.MUA },
    };
    onSave(newSession);
  };

  const handleAISuggest = async () => {
    if (!form.title || !form.location) {
      alert("Por favor ingresa un título y ubicación para generar un concepto.");
      return;
    }
    setLoadingAI(true);
    const suggestion = await generateSessionTheme(form.title, form.location, form.photographerName, form.modelName);
    setForm(prev => ({ ...prev, description: suggestion || prev.description }));
    setLoadingAI(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-black w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} className="text-black" />
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-yellow-400 inline-block text-black">Agendar Sesión</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 mb-1">Título de la Sesión</label>
                <input 
                  required
                  className="w-full border-2 border-black p-3 focus:bg-yellow-50 outline-none transition-colors text-black placeholder:text-neutral-400"
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="Ej: Urban Style 2024"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 mb-1">Fecha</label>
                  <input 
                    type="date"
                    className="w-full border-2 border-black p-3 outline-none text-black bg-white"
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 mb-1">Hora</label>
                  <input 
                    type="time"
                    className="w-full border-2 border-black p-3 outline-none text-black bg-white"
                    value={form.time}
                    onChange={e => setForm({...form, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-neutral-800 mb-1">Ubicación</label>
                <input 
                  required
                  className="w-full border-2 border-black p-3 focus:bg-yellow-50 outline-none transition-colors text-black placeholder:text-neutral-400"
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                  placeholder="Ej: Studio 5 o Calle 42"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-neutral-800 mb-1">
                  <span>Descripción / Concepto</span>
                  <button 
                    type="button"
                    onClick={handleAISuggest}
                    disabled={loadingAI}
                    className="flex items-center gap-1 text-yellow-600 hover:text-black font-black transition-colors"
                  >
                    {loadingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    AI Concept
                  </button>
                </label>
                <textarea 
                  className="w-full border-2 border-black p-3 h-[155px] resize-none focus:bg-yellow-50 outline-none text-black placeholder:text-neutral-400"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Detalles del moodboard o estilo..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h3 className="font-bold border-l-4 border-black pl-3 text-sm uppercase text-black">Equipo Colaborativo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photographer */}
              <div className="p-4 bg-neutral-100 border-2 border-black">
                <p className="text-[10px] font-black uppercase text-neutral-700 mb-3 tracking-tighter">FOTÓGRAFO/A</p>
                <input 
                  required
                  placeholder="Nombre"
                  className="w-full bg-transparent border-b border-black mb-2 py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.photographerName}
                  onChange={e => setForm({...form, photographerName: e.target.value})}
                />
                <input 
                  required
                  placeholder="@instagram"
                  className="w-full bg-transparent border-b border-black py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.photographerIG}
                  onChange={e => setForm({...form, photographerIG: e.target.value})}
                />
              </div>
              {/* Model */}
              <div className="p-4 bg-neutral-100 border-2 border-black">
                <p className="text-[10px] font-black uppercase text-neutral-700 mb-3 tracking-tighter">MODELO</p>
                <input 
                  required
                  placeholder="Nombre"
                  className="w-full bg-transparent border-b border-black mb-2 py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.modelName}
                  onChange={e => setForm({...form, modelName: e.target.value})}
                />
                <input 
                  required
                  placeholder="@instagram"
                  className="w-full bg-transparent border-b border-black py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.modelIG}
                  onChange={e => setForm({...form, modelIG: e.target.value})}
                />
              </div>
              {/* MUA */}
              <div className="p-4 bg-neutral-100 border-2 border-black">
                <p className="text-[10px] font-black uppercase text-neutral-700 mb-3 tracking-tighter">MAQUILLADOR/A</p>
                <input 
                  required
                  placeholder="Nombre"
                  className="w-full bg-transparent border-b border-black mb-2 py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.muaName}
                  onChange={e => setForm({...form, muaName: e.target.value})}
                />
                <input 
                  required
                  placeholder="@instagram"
                  className="w-full bg-transparent border-b border-black py-1 outline-none text-sm text-black placeholder:text-neutral-500"
                  value={form.muaIG}
                  onChange={e => setForm({...form, muaIG: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-yellow-400 border-2 border-black p-4 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0 active:translate-y-[1px] text-black"
          >
            Confirmar Sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;
