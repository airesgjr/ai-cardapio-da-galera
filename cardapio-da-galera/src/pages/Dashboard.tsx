import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Evento } from '../services/interface/types';
import { getEventos } from '../services/supabaseService';
import { Calendar, Users, Utensils } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      if (!user) return;
      try {
        const data = await getEventos(user.id);
        setEventos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventos();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Olá, {user?.nome}</h1>
        <Link
          to="/eventos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Novo Evento
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-300">Meus Eventos</h3>
            <Calendar className="text-blue-400" size={24} />
          </div>
          <p className="text-3xl font-bold text-white">{eventos.length}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Próximos Eventos</h2>
        {loading ? (
          <div className="text-slate-400">Carregando...</div>
        ) : eventos.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
            <p className="text-slate-400 mb-4">Você ainda não tem eventos cadastrados.</p>
            <Link
              to="/eventos/novo"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Criar meu primeiro evento
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map(evento => (
              <Link
                key={evento.id}
                to={`/eventos/${evento.id}`}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors block group"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {evento.nome}
                </h3>
                <div className="space-y-2 text-sm text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span>
                      {new Date(evento.dataInicio).toLocaleDateString()} - {new Date(evento.dataFim).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>{evento.participantes.length} participantes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
