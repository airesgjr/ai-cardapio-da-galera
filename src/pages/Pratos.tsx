import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Prato } from '../services/interface/types';
import { getPratos, deletePrato, createPrato } from '../services/supabaseService';
import { Plus, Trash2, Edit, Search, Globe, Lock, Copy } from 'lucide-react';

export default function Pratos() {
  const { user } = useAuth();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const fetchPratos = async () => {
    try {
      const data = await getPratos();
      setPratos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPratos();
  }, []);

  const handleDelete = async (id: string, usuarioId: string) => {
    if (user?.id !== usuarioId) {
      alert('Você só pode excluir seus próprios pratos.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja excluir este prato?')) return;
    try {
      await deletePrato(id);
      fetchPratos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (prato: Prato) => {
    try {
      if (!user) return;
      const novoPrato = {
        nome: `${prato.nome} (Cópia)`,
        usuarioId: user.id,
        publico: false,
        ingredientes: prato.ingredientes.map(ing => ({
          ingredienteId: ing.ingredienteId,
          quantidade: ing.quantidade,
          unidade: ing.unidade
        }))
      };
      await createPrato(novoPrato);
      fetchPratos();
      alert('Prato copiado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao copiar o prato.');
    }
  };

  const filtrados = pratos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Pratos</h1>
        <Link
          to="/pratos/novo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Prato</span>
        </Link>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar pratos..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-slate-400 text-center py-8">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-slate-400 text-center py-8">Nenhum prato encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(prato => (
              <div
                key={prato.id}
                className="bg-slate-900 border border-slate-700 p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white truncate pr-4" title={prato.nome}>
                      {prato.nome}
                    </h3>
                    <div className="text-slate-400" title={prato.publico ? 'Público' : 'Privado'}>
                      {prato.publico ? <Globe size={20} /> : <Lock size={20} />}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    {prato.ingredientes.length} ingrediente(s)
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
                  <button
                    onClick={() => handleDuplicate(prato)}
                    className="p-2 text-green-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Copiar Prato"
                  >
                    <Copy size={20} />
                  </button>
                  {user?.id === prato.usuarioId && (
                    <>
                      <Link
                        to={`/pratos/${prato.id}`}
                        className="p-2 text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit size={20} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prato.id, prato.usuarioId)}
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
