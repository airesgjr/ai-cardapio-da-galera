import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Evento, Refeicao, Prato } from '../services/interface/types';
import { getEventos, getRefeicoes, deleteRefeicao, getPratos, addEventoUsuario, removeEventoUsuario, getUsuariosPorEmail } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, Edit, ArrowLeft, ShoppingCart, Calendar, Users, Utensils, Shield, UserPlus, X, Search } from 'lucide-react';

export default function EventoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);

  const [emailConvite, setEmailConvite] = useState('');
  const [permissaoConvite, setPermissaoConvite] = useState<'admin' | 'viewer'>('viewer');
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<any[]>([]);
  const [convidando, setConvidando] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [eventosData, refeicoesData, pratosData] = await Promise.all([
        getEventos(user.id),
        getRefeicoes(),
        getPratos()
      ]);

      const foundEvento = eventosData.find(e => e.id === id);
      if (!foundEvento) {
        navigate('/eventos');
        return;
      }

      setEvento(foundEvento);
      setRefeicoes(refeicoesData.filter(r => r.eventoId === id));
      setPratos(pratosData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, navigate]);

  const handleDeleteRefeicao = async (refeicaoId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta refeição?')) return;
    try {
      await deleteRefeicao(refeicaoId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getPratoNome = (pratoId: string) => {
    return pratos.find(p => p.id === pratoId)?.nome || 'Prato não encontrado';
  };

  const handleBuscarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailConvite) return;
    setBuscandoUsuarios(true);
    try {
      const res = await getUsuariosPorEmail(emailConvite);
      const filtrados = res.filter((u: any) => u.id !== user?.id && !evento?.usuariosPermitidos?.some(eu => eu.usuarioId === u.id));
      setUsuariosEncontrados(filtrados);
    } catch (err) {
      console.error(err);
    } finally {
      setBuscandoUsuarios(false);
    }
  };

  const handleConvidar = async (usuarioId: string) => {
    if (!evento || !user) return;
    setConvidando(true);
    try {
      await addEventoUsuario(evento.id, usuarioId, permissaoConvite);
      setEmailConvite('');
      setUsuariosEncontrados([]);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Erro ao convidar usuário');
    } finally {
      setConvidando(false);
    }
  };

  const handleRemoverConvite = async (eventoUsuarioId: string) => {
    if (!window.confirm('Remover acesso deste usuário?')) return;
    try {
      await removeEventoUsuario(eventoUsuarioId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="text-slate-400 text-center py-8">Carregando...</div>;
  if (!evento) return null;

  const isDono = user?.id === evento.usuarioId;
  const minhaPermissao = isDono ? 'admin' : evento.usuariosPermitidos?.find(eu => eu.usuarioId === user?.id)?.permissao;
  const canEdit = isDono || minhaPermissao === 'admin';

  // Agrupar refeições por data
  const refeicoesPorData = refeicoes.reduce((acc, ref) => {
    if (!acc[ref.data]) acc[ref.data] = [];
    acc[ref.data].push(ref);
    return acc;
  }, {} as Record<string, Refeicao[]>);

  const datasOrdenadas = Object.keys(refeicoesPorData).sort();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/eventos')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-white truncate">{evento.nome}</h1>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/eventos/${evento.id}/compras`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Lista de Compras</span>
          </Link>
          {canEdit && (
            <Link
              to={`/eventos/${evento.id}/refeicoes/nova`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Nova Refeição</span>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 md:col-span-1 h-fit">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">Detalhes</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-slate-300">
              <Calendar className="text-blue-400 mt-1" size={20} />
              <div>
                <p className="font-medium text-white">Período</p>
                <p className="text-sm">{new Date(evento.dataInicio).toLocaleDateString()} até {new Date(evento.dataFim).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-slate-300">
              <Users className="text-blue-400 mt-1" size={20} />
              <div>
                <p className="font-medium text-white">Participantes ({evento.participantes.length})</p>
                <ul className="text-sm mt-2 space-y-1">
                  {evento.participantes.map(p => (
                    <li key={p.id} className="flex justify-between">
                      <span>{p.nome}</span>
                      <span className="text-slate-500">{p.tipoRefeicao === 'inteira' ? 'Inteira' : 'Meia'}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Compartilhamento */}
          {isDono && (
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mt-6 md:col-span-1 h-fit">
              <h2 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-blue-400" />
                Compartilhamento
              </h2>

              <form onSubmit={handleBuscarUsuario} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Buscar por Email</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={emailConvite}
                      onChange={e => setEmailConvite(e.target.value)}
                      placeholder="email@amigo.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={buscandoUsuarios} className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg">
                      <Search size={20} />
                    </button>
                  </div>
                </div>

                {usuariosEncontrados.length > 0 && (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 space-y-2">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs text-slate-400">Permissão:</span>
                      <select
                        value={permissaoConvite}
                        onChange={e => setPermissaoConvite(e.target.value as any)}
                        className="bg-slate-800 text-xs text-white border border-slate-700 rounded p-1"
                      >
                        <option value="viewer">Visualizador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    {usuariosEncontrados.map(u => (
                      <div key={u.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                        <span className="text-sm text-slate-300 truncate max-w-[120px]" title={u.email}>{u.nome}</span>
                        <button
                          type="button"
                          onClick={() => handleConvidar(u.id)}
                          disabled={convidando}
                          className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                        >
                          <UserPlus size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {buscandoUsuarios && <p className="text-xs text-slate-400">Buscando...</p>}
              </form>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 border-b border-slate-700 pb-2">Com acesso:</h3>
                {evento.usuariosPermitidos?.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Apenas você tem acesso</p>
                ) : (
                  evento.usuariosPermitidos?.map(eu => (
                    <div key={eu.id} className="flex items-center justify-between text-sm">
                      <div className="flex flex-col">
                        <span className="text-slate-300">{eu.usuario?.nome}</span>
                        <span className="text-xs text-slate-500">{eu.permissao === 'admin' ? 'Admin' : 'Visualizador'}</span>
                      </div>
                      <button
                        onClick={() => handleRemoverConvite(eu.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remover acesso"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-slate-200">Refeições Programadas</h2>

          {datasOrdenadas.length === 0 ? (
            <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
              <Utensils className="mx-auto text-slate-500 mb-4" size={48} />
              <p className="text-slate-400 mb-4">Nenhuma refeição cadastrada para este evento.</p>
              {canEdit && (
                <Link
                  to={`/eventos/${evento.id}/refeicoes/nova`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Adicionar a primeira refeição
                </Link>
              )}
            </div>
          ) : (
            datasOrdenadas.map(data => (
              <div key={data} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="bg-slate-900/50 px-6 py-3 border-b border-slate-700">
                  <h3 className="font-semibold text-blue-400">{new Date(data).toLocaleDateString()}</h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {refeicoesPorData[data].map(ref => (
                    <div key={ref.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                            {ref.tipo}
                          </span>
                          <h4 className="text-lg font-bold text-white">{getPratoNome(ref.pratoId)}</h4>
                        </div>
                        <p className="text-sm text-slate-400">
                          {ref.participantesIds.length} participante(s)
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Link
                            to={`/eventos/${evento.id}/refeicoes/${ref.id}`}
                            className="p-2 text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={20} />
                          </Link>
                          <button
                            onClick={() => handleDeleteRefeicao(ref.id)}
                            className="p-2 text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
