import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ingrediente } from '../services/interface/types';
import { getIngredientes, createIngrediente, deleteIngrediente } from '../services/supabaseService';
import { Plus, Trash2, Search } from 'lucide-react';

export default function Ingredientes() {
  const { user } = useAuth();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [busca, setBusca] = useState('');
  const [error, setError] = useState('');

  const fetchIngredientes = async () => {
    try {
      const data = await getIngredientes();
      setIngredientes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !user) return;
    
    setError('');
    try {
      await createIngrediente({ nome: nome.trim(), usuarioId: user.id });
      setNome('');
      fetchIngredientes();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar ingrediente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este ingrediente?')) return;
    try {
      await deleteIngrediente(id);
      fetchIngredientes();
    } catch (err) {
      console.error(err);
    }
  };

  const filtrados = ingredientes.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Ingredientes</h1>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Novo Ingrediente</h2>
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do ingrediente (ex: Arroz, Feijão)"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </form>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar ingredientes..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-8">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-slate-400 text-center py-8">Nenhum ingrediente encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtrados.map(ingrediente => (
              <div
                key={ingrediente.id}
                className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex justify-between items-center group"
              >
                <span className="text-slate-200 font-medium truncate" title={ingrediente.nome}>
                  {ingrediente.nome}
                </span>
                <button
                  onClick={() => handleDelete(ingrediente.id)}
                  className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
