
import React from 'react';
import { PhotoSession, Role } from '../types';
import { Calendar, MapPin, Instagram, Clock, Trash2, Share2 } from 'lucide-react';

interface SessionCardProps {
  session: PhotoSession;
  onDelete: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onDelete }) => {
  const getIGLink = (handle: string) => `https://instagram.com/${handle.replace('@', '')}`;

  const formatDisplayDate = (dateStr: string) => {
    return dateStr.split('-').reverse().join('-');
  };

  const handleShare = () => {
    const text = `
📸 *COLABO: ${session.title}*
📅 Fecha: ${formatDisplayDate(session.date)}
⏰ Hora: ${session.time}
📍 Lugar: ${session.location}

👥 *EQUIPO:*
- Fotógrafo: ${session.photographer.name} (${session.photographer.instagram})
- Modelo: ${session.model.name} (${session.model.instagram})
- MUA: ${session.mua.name} (${session.mua.instagram})

💡 *Concepto:*
${session.description}

_Generado en Colabos con Manolakos_
    `.trim();
    
    navigator.clipboard.writeText(text);
    alert('¡Resumen de la sesión copiado al portapapeles! Ya puedes pegarlo en WhatsApp.');
  };

  const MemberLink: React.FC<{ role: Role; name: string; ig: string }> = ({ role, name, ig }) => (
    <div className="flex items-center justify-between text-sm py-1 border-b border-neutral-100 last:border-0">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">{role}</span>
        <span className="font-medium text-black">{name}</span>
      </div>
      <a 
        href={getIGLink(ig)} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-neutral-400 hover:text-yellow-500 transition-colors"
      >
        <Instagram size={16} />
      </a>
    </div>
  );

  return (
    <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-black">{session.title}</h3>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-yellow-500" />
              <span>{formatDisplayDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-yellow-500" />
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-yellow-500" />
              <span>{session.location}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={handleShare}
            title="Compartir resumen"
            className="text-neutral-300 hover:text-black transition-colors p-1"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => onDelete(session.id)}
            className="text-neutral-300 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-sm text-neutral-600 mb-4 line-clamp-2 italic border-l-2 border-yellow-400 pl-3">
        "{session.description}"
      </p>

      <div className="space-y-1 bg-neutral-50 p-3">
        <MemberLink role={Role.PHOTOGRAPHER} name={session.photographer.name} ig={session.photographer.instagram} />
        <MemberLink role={Role.MODEL} name={session.model.name} ig={session.model.instagram} />
        <MemberLink role={Role.MUA} name={session.mua.name} ig={session.mua.instagram} />
      </div>
    </div>
  );
};

export default SessionCard;
