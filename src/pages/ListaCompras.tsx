import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Evento, Refeicao, Prato, Ingrediente } from '../services/interface/types';
import { getEventos, getRefeicoes, getPratos, getIngredientes } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Layers, List, Copy } from 'lucide-react';

interface IngredienteCalculado {
  ingredienteId: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

interface RefeicaoCalculada {
  refeicaoId: string;
  data: string;
  tipo: string;
  pratoNome: string;
  ingredientes: IngredienteCalculado[];
}

export default function ListaCompras() {
  const { id: eventoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evento, setEvento] = useState<Evento | null>(null);
  const [refeicoesCalculadas, setRefeicoesCalculadas] = useState<RefeicaoCalculada[]>([]);
  const [listaAgrupada, setListaAgrupada] = useState<IngredienteCalculado[]>([]);
  const [modoAgrupado, setModoAgrupado] = useState(false);

  const handleCopyWhatsApp = async () => {
    if (!evento) return;
    let text = `*Lista de Compras - ${evento.nome}*\n\n`;
    listaAgrupada.forEach(ing => {
      text += `• ${ing.quantidade} ${ing.unidade} ${ing.nome}\n`;
    });
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      alert('Lista copiada para a área de transferência!');
    } catch (err) {
      console.error('Falha ao copiar', err);
      alert('Erro ao copiar a lista.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [eventosData, refeicoesData, pratosData, ingredientesData] = await Promise.all([
          getEventos(user.id),
          getRefeicoes(),
          getPratos(),
          getIngredientes()
        ]);

        const ev = eventosData.find(e => e.id === eventoId);
        if (!ev) {
          navigate('/eventos');
          return;
        }

        setEvento(ev);

        const refeicoesEvento = refeicoesData.filter(r => r.eventoId === eventoId);
        
        const calculadas: RefeicaoCalculada[] = refeicoesEvento.map(ref => {
          const prato = pratosData.find(p => p.id === ref.pratoId);
          const pratoNome = prato ? prato.nome : 'Prato Desconhecido';

          // Calcular total de porções necessárias
          let totalPorcoes = 0;
          ref.participantesIds.forEach(pId => {
            const participante = ev.participantes.find(p => p.id === pId);
            if (participante) {
              totalPorcoes += participante.tipoRefeicao === 'inteira' ? 1 : 0.5;
            }
          });

          const ingredientesCalc: IngredienteCalculado[] = ref.ingredientes.map(ing => {
            const ingredienteDb = ingredientesData.find(i => i.id === ing.ingredienteId);
            return {
              ingredienteId: ing.ingredienteId,
              nome: ingredienteDb ? ingredienteDb.nome : 'Desconhecido',
              quantidade: Number((ing.quantidade * totalPorcoes).toFixed(1)),
              unidade: ing.unidade
            };
          });

          return {
            refeicaoId: ref.id,
            data: ref.data,
            tipo: ref.tipo,
            pratoNome,
            ingredientes: ingredientesCalc
          };
        });

        // Ordenar por data e tipo
        calculadas.sort((a, b) => {
          if (a.data !== b.data) return a.data.localeCompare(b.data);
          return a.tipo.localeCompare(b.tipo);
        });

        setRefeicoesCalculadas(calculadas);

        // Agrupar ingredientes
        const agrupadosMap = new Map<string, IngredienteCalculado>();
        
        calculadas.forEach(ref => {
          ref.ingredientes.forEach(ing => {
            const key = `${ing.ingredienteId}-${ing.unidade}`;
            if (agrupadosMap.has(key)) {
              const existente = agrupadosMap.get(key)!;
              existente.quantidade += ing.quantidade;
              // Arredondar para 1 casa decimal
              existente.quantidade = Number(existente.quantidade.toFixed(1));
            } else {
              agrupadosMap.set(key, { ...ing });
            }
          });
        });

        const agrupadosArray = Array.from(agrupadosMap.values()).sort((a, b) => a.nome.localeCompare(b.nome));
        setListaAgrupada(agrupadosArray);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [eventoId, navigate]);

  if (loading) return <div className="text-slate-400 text-center py-8">Carregando...</div>;
  if (!evento) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/eventos/${eventoId}`)} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Lista de Compras</h1>
            <p className="text-slate-400">{evento.nome}</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 w-full sm:w-auto">
          <button
            onClick={() => setModoAgrupado(false)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              !modoAgrupado ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={18} />
            <span className="text-sm font-medium">Por Refeição</span>
          </button>
          <button
            onClick={() => setModoAgrupado(true)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              modoAgrupado ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={18} />
            <span className="text-sm font-medium">Agrupada</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        {modoAgrupado ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-slate-200">Lista Agrupada (Total)</h2>
              {listaAgrupada.length > 0 && (
                <button
                  onClick={handleCopyWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Copy size={16} />
                  <span>Copiar lista</span>
                </button>
              )}
            </div>
            {listaAgrupada.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Nenhum ingrediente necessário.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listaAgrupada.map((ing, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex items-center">
                    <span className="text-slate-200 font-medium truncate" title={ing.nome}>
                      <span className="text-blue-400 font-bold mr-2">
                        {ing.quantidade} {ing.unidade}
                      </span>
                      {ing.nome}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {refeicoesCalculadas.length === 0 ? (
              <p className="text-slate-400 text-center py-8">Nenhuma refeição cadastrada.</p>
            ) : (
              refeicoesCalculadas.map(ref => (
                <div key={ref.refeicaoId} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                        {ref.tipo}
                      </span>
                      <h3 className="text-lg font-bold text-white">{ref.pratoNome}</h3>
                    </div>
                    <span className="text-slate-400 text-sm font-medium">
                      {new Date(ref.data).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {ref.ingredientes.length === 0 ? (
                    <p className="text-slate-500 text-sm italic">Prato sem ingredientes cadastrados.</p>
                  ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2">
                      {ref.ingredientes.map((ing, idx) => (
                        <li key={idx} className="flex justify-start items-center text-sm border-b border-slate-700/50 pb-1 last:border-0">
                          <span className="text-blue-400 font-medium mr-2 whitespace-nowrap">
                            {ing.quantidade} {ing.unidade}
                          </span>
                          <span className="text-slate-300 truncate">{ing.nome}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
