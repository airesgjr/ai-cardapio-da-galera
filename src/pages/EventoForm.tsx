import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Participante } from '../services/interface/types';
import { createEvento, getEventos, updateEvento } from '../services/supabaseService';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function EventoForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [participantes, setParticipantes] = useState<Participante[]>([]);

  const [novoParticipante, setNovoParticipante] = useState('');
  const [novoTipoRefeicao, setNovoTipoRefeicao] = useState<'inteira' | 'meia'>('inteira');

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          if (!user) return;
          const eventos = await getEventos(user.id);
          const evento = eventos.find(e => e.id === id);
          if (evento) {
            if (evento.usuarioId !== user.id) {
              alert('Você não tem permissão para editar este evento. Apenas visualizar.');
              navigate('/eventos');
              return;
            }
            setNome(evento.nome);
            setDataInicio(evento.dataInicio);
            setDataFim(evento.dataFim);
            setParticipantes(evento.participantes);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    loadData();
  }, [id, user, navigate]);

  const handleAddParticipante = () => {
    if (!novoParticipante.trim()) return;

    setParticipantes([
      ...participantes,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        nome: novoParticipante.trim(),
        tipoRefeicao: novoTipoRefeicao
      }
    ]);

    setNovoParticipante('');
    setNovoTipoRefeicao('inteira');
  };

  const handleRemoveParticipante = (participanteId: string) => {
    setParticipantes(participantes.filter(p => p.id !== participanteId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !dataInicio || !dataFim || !user) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      setError('A data de início não pode ser maior que a data de fim.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const eventoData = {
        nome: nome.trim(),
        dataInicio,
        dataFim,
        usuarioId: user.id,
        participantes
      };

      if (id) {
        await updateEvento(id, eventoData);
      } else {
        await createEvento(eventoData);
      }
      navigate('/eventos');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/eventos')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white">{id ? 'Editar Evento' : 'Novo Evento'}</h1>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Evento</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Praia com a galera"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data de Início</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data de Fim</label>
              <input
                type="date"
                required
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Participantes</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={novoParticipante}
                  onChange={(e) => setNovoParticipante(e.target.value)}
                  placeholder="Nome do participante"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="w-full md:w-48">
                <select
                  value={novoTipoRefeicao}
                  onChange={(e) => setNovoTipoRefeicao(e.target.value as 'inteira' | 'meia')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="inteira">Refeição Inteira</option>
                  <option value="meia">Meia Refeição</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddParticipante}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
              </button>
            </div>

            {participantes.length > 0 ? (
              <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3">Tipo de Refeição</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantes.map((p) => (
                      <tr key={p.id} className="border-b border-slate-800 last:border-0">
                        <td className="px-6 py-4 font-medium text-white">{p.nome}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.tipoRefeicao === 'inteira' ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
                          }`}>
                            {p.tipoRefeicao === 'inteira' ? 'Inteira' : 'Meia'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveParticipante(p.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">Nenhum participante adicionado ainda.</p>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Salvando...' : 'Salvar Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
