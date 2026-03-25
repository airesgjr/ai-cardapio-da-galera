import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Evento, Prato, TipoRefeicao } from '../services/interface/types';
import { getEventos, getPratos, createRefeicao, getRefeicoes, updateRefeicao } from '../services/supabaseService';
import { Save, ArrowLeft, RefreshCw } from 'lucide-react';

export default function RefeicaoForm() {
  const { id: eventoId, refeicaoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [evento, setEvento] = useState<Evento | null>(null);
  const [pratos, setPratos] = useState<Prato[]>([]);

  const [pratoId, setPratoId] = useState('');
  const [tipo, setTipo] = useState<TipoRefeicao>('Almoço');
  const [data, setData] = useState('');
  const [participantesSelecionados, setParticipantesSelecionados] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [eventosData, pratosData, refeicoesData] = await Promise.all([
          getEventos(user.id),
          getPratos(),
          getRefeicoes()
        ]);

        const ev = eventosData.find(e => e.id === eventoId);
        if (!ev) {
          navigate('/eventos');
          return;
        }

        setEvento(ev);
        setPratos(pratosData);

        if (refeicaoId) {
          const ref = refeicoesData.find(r => r.id === refeicaoId);
          if (ref) {
            setPratoId(ref.pratoId);
            setTipo(ref.tipo);
            setData(ref.data);
            setParticipantesSelecionados(ref.participantesIds);
          }
        } else {
          // Default: all participants selected, first day of event
          setParticipantesSelecionados(ev.participantes.map(p => p.id));
          setData(ev.dataInicio);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [eventoId, refeicaoId, navigate]);

  const handleToggleParticipante = (pId: string) => {
    setParticipantesSelecionados(prev => 
      prev.includes(pId) ? prev.filter(id => id !== pId) : [...prev, pId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pratoId || !data || participantesSelecionados.length === 0 || !eventoId) {
      setError('Preencha todos os campos e selecione pelo menos um participante.');
      return;
    }

    if (data < evento!.dataInicio || data > evento!.dataFim) {
      setError(`A data deve estar entre ${evento!.dataInicio} e ${evento!.dataFim}.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pratoSelecionado = pratos.find(p => p.id === pratoId);
      if (!pratoSelecionado) throw new Error('Prato não encontrado');

      // Snapshot dos ingredientes
      const ingredientesSnapshot = pratoSelecionado.ingredientes.map(ing => ({
        ingredienteId: ing.ingredienteId,
        quantidade: ing.quantidade,
        unidade: ing.unidade
      }));

      const refeicaoData = {
        eventoId,
        pratoId,
        tipo,
        data,
        participantesIds: participantesSelecionados,
        ingredientes: ingredientesSnapshot
      };

      if (refeicaoId) {
        await updateRefeicao(refeicaoId, refeicaoData);
      } else {
        await createRefeicao(refeicaoData);
      }
      navigate(`/eventos/${eventoId}`);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar refeição');
    } finally {
      setLoading(false);
    }
  };

  const handleAtualizarIngredientes = async () => {
    if (!refeicaoId || !pratoId) return;
    if (!window.confirm('Isso irá substituir os ingredientes desta refeição pela receita atual do prato. Continuar?')) return;
    
    setLoading(true);
    try {
      const pratoSelecionado = pratos.find(p => p.id === pratoId);
      if (!pratoSelecionado) throw new Error('Prato não encontrado');

      const ingredientesSnapshot = pratoSelecionado.ingredientes.map(ing => ({
        ingredienteId: ing.ingredienteId,
        quantidade: ing.quantidade,
        unidade: ing.unidade
      }));

      await updateRefeicao(refeicaoId, { ingredientes: ingredientesSnapshot });
      alert('Ingredientes atualizados com sucesso!');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar ingredientes');
    } finally {
      setLoading(false);
    }
  };

  if (!evento) return <div className="text-slate-400 text-center py-8">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/eventos/${eventoId}`)} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white">{refeicaoId ? 'Editar Refeição' : 'Nova Refeição'}</h1>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Prato</label>
              <select
                required
                value={pratoId}
                onChange={(e) => setPratoId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecione um prato</option>
                {pratos.map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Refeição</label>
              <select
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value as TipoRefeicao)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Café da manhã">Café da manhã</option>
                <option value="Almoço">Almoço</option>
                <option value="Café da tarde">Café da tarde</option>
                <option value="Janta">Janta</option>
                <option value="Lanche da madrugada">Lanche da madrugada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Data</label>
              <input
                type="date"
                required
                min={evento.dataInicio}
                max={evento.dataFim}
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Evento: {new Date(evento.dataInicio).toLocaleDateString()} a {new Date(evento.dataFim).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-200">Participantes</h2>
              <button
                type="button"
                onClick={() => setParticipantesSelecionados(
                  participantesSelecionados.length === evento.participantes.length 
                    ? [] 
                    : evento.participantes.map(p => p.id)
                )}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {participantesSelecionados.length === evento.participantes.length ? 'Desmarcar Todos' : 'Marcar Todos'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {evento.participantes.map(p => (
                <label
                  key={p.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    participantesSelecionados.includes(p.id)
                      ? 'bg-blue-900/20 border-blue-500/50'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={participantesSelecionados.includes(p.id)}
                    onChange={() => handleToggleParticipante(p.id)}
                    className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium">{p.nome}</span>
                    <span className="text-xs text-slate-500">{p.tipoRefeicao === 'inteira' ? 'Inteira' : 'Meia'}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-700">
            {refeicaoId ? (
              <button
                type="button"
                onClick={handleAtualizarIngredientes}
                className="text-slate-400 hover:text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                title="Atualiza os ingredientes desta refeição com a receita atual do prato"
              >
                <RefreshCw size={20} />
                <span className="hidden sm:inline">Atualizar Receita</span>
              </button>
            ) : <div></div>}

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Salvando...' : 'Salvar Refeição'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
