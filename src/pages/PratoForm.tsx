import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Ingrediente, PratoIngrediente } from '../services/interface/types';
import { getIngredientes, createIngrediente, createPrato, getPratos, updatePrato } from '../services/supabaseService';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

export default function PratoForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [nome, setNome] = useState('');
  const [publico, setPublico] = useState(true);
  const [ingredientes, setIngredientes] = useState<PratoIngrediente[]>([]);
  const [dbIngredientes, setDbIngredientes] = useState<Ingrediente[]>([]);

  const [novoIngrediente, setNovoIngrediente] = useState('');
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [novaUnidade, setNovaUnidade] = useState('UN');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ing = await getIngredientes();
        setDbIngredientes(ing);

        if (id) {
          const pratos = await getPratos();
          const prato = pratos.find(p => p.id === id);
          if (prato) {
            if (prato.usuarioId !== user?.id) {
              alert('Você não tem permissão para editar este prato.');
              navigate('/pratos');
              return;
            }
            setNome(prato.nome);
            setPublico(prato.publico);
            setIngredientes(prato.ingredientes);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [id, user, navigate]);

  const handleAddIngrediente = async () => {
    if (!novoIngrediente.trim() || !novaQuantidade || !user) return;

    let ingredienteId = '';
    const existing = dbIngredientes.find(i => i.nome.toLowerCase() === novoIngrediente.trim().toLowerCase());

    if (existing) {
      ingredienteId = existing.id;
    } else {
      try {
        const created = await createIngrediente({ nome: novoIngrediente.trim(), usuarioId: user.id });
        ingredienteId = created.id;
        setDbIngredientes([...dbIngredientes, created]);
      } catch (err: any) {
        setError(err.message || 'Erro ao criar ingrediente');
        return;
      }
    }

    if (ingredientes.some(i => i.ingredienteId === ingredienteId)) {
      setError('Ingrediente já adicionado ao prato');
      return;
    }

    setIngredientes([
      ...ingredientes,
      {
        ingredienteId,
        quantidade: parseFloat(novaQuantidade),
        unidade: novaUnidade
      }
    ]);

    setNovoIngrediente('');
    setNovaQuantidade('');
    setNovaUnidade('UN');
    setError('');
  };

  const handleRemoveIngrediente = (ingredienteId: string) => {
    setIngredientes(ingredientes.filter(i => i.ingredienteId !== ingredienteId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || ingredientes.length === 0 || !user) {
      setError('Preencha o nome e adicione pelo menos um ingrediente.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pratoData = {
        nome: nome.trim(),
        usuarioId: user.id,
        publico,
        ingredientes
      };

      if (id) {
        await updatePrato(id, pratoData);
      } else {
        await createPrato(pratoData);
      }
      navigate('/pratos');
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar prato');
    } finally {
      setLoading(false);
    }
  };

  const getIngredienteNome = (id: string) => {
    return dbIngredientes.find(i => i.id === id)?.nome || 'Desconhecido';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/pratos')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-white">{id ? 'Editar Prato' : 'Novo Prato'}</h1>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        {error && <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Prato</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Strogonoff de Frango"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-3 cursor-pointer mt-6">
                <input
                  type="checkbox"
                  checked={publico}
                  onChange={(e) => setPublico(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
                />
                <span className="text-slate-300 font-medium">Prato Público (outros podem ver e usar)</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Ingredientes (Por Pessoa)</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={novoIngrediente}
                  onChange={(e) => {
                    setNovoIngrediente(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Nome do ingrediente"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showDropdown && novoIngrediente.trim().length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-lg shadow-xl custom-scrollbar">
                    {dbIngredientes
                      .filter(i => i.nome.toLowerCase().includes(novoIngrediente.toLowerCase()))
                      .map(i => (
                        <li
                          key={i.id}
                          onClick={() => {
                            setNovoIngrediente(i.nome);
                            setShowDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-slate-200 transition-colors"
                        >
                          {i.nome}
                        </li>
                      ))}
                    {dbIngredientes.filter(i => i.nome.toLowerCase().includes(novoIngrediente.toLowerCase())).length === 0 && (
                      <li className="px-4 py-3 text-sm text-slate-500 italic text-center">
                        Nenhum ingrediente cadastrado com esse nome. Será criado ao salvar o prato se for novo.
                      </li>
                    )}
                  </ul>
                )}
              </div>
              
              <div className="w-full md:w-32">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={novaQuantidade}
                  onChange={(e) => setNovaQuantidade(e.target.value)}
                  placeholder="Qtd"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-full md:w-40">
                <select
                  value={novaUnidade}
                  onChange={(e) => setNovaUnidade(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UN">UN</option>
                  <option value="GR">GR</option>
                  <option value="ML">ML</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddIngrediente}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
              </button>
            </div>

            {ingredientes.length > 0 ? (
              <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="px-6 py-3">Ingrediente</th>
                      <th className="px-6 py-3">Quantidade</th>
                      <th className="px-6 py-3">Unidade</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientes.map((ing, idx) => (
                      <tr key={idx} className="border-b border-slate-800 last:border-0">
                        <td className="px-6 py-4 font-medium text-white">{getIngredienteNome(ing.ingredienteId)}</td>
                        <td className="px-6 py-4">{ing.quantidade}</td>
                        <td className="px-6 py-4">{ing.unidade}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveIngrediente(ing.ingredienteId)}
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
              <p className="text-slate-400 text-center py-4">Nenhum ingrediente adicionado ainda.</p>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-700">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Salvando...' : 'Salvar Prato'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
