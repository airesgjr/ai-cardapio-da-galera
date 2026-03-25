import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Evento } from '../services/interface/types';
import { getEventos, deleteEvento } from '../services/supabaseService';
import { Plus, Trash2, Edit, Search, Calendar, Users } from 'lucide-react';

export default function Eventos() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const fetchEventos = async () => {
    if (!user) return;
    try {
      const data = await getEventos(user.id);
      setEventos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleDelete = async (id: string, usuarioId: string) => {
    if (user?.id !== usuarioId) {
      alert('Você só pode excluir seus próprios eventos.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
      await deleteEvento(id);
      fetchEventos();
    } catch (err) {
      console.error(err);
    }
  };

  const filtrados = eventos.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Eventos</h1>
        <Link
          to="/eventos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Evento</span>
        </Link>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-8">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-slate-400 text-center py-8">Nenhum evento encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(evento => (
              <div
                key={evento.id}
                className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <Link to={`/eventos/${evento.id}`}>
                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors truncate" title={evento.nome}>
                      {evento.nome}
                    </h3>
                  </Link>
                  <div className="space-y-2 text-sm text-slate-400 mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(evento.dataInicio).toLocaleDateString()} até {new Date(evento.dataFim).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} />
                      <span>{evento.participantes.length} participantes</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  {user?.id === evento.usuarioId && (
                    <>
                      <button
                        onClick={() => handleDelete(evento.id, evento.usuarioId)}
                        className="p-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
