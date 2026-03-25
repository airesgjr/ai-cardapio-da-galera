export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  cidade: string;
  estado: string;
  telefone?: string;
}

export interface Ingrediente {
  id: string;
  nome: string;
  usuarioId: string;
}

export interface PratoIngrediente {
  ingredienteId: string;
  quantidade: number;
  unidade: string;
}

export interface Prato {
  id: string;
  nome: string;
  usuarioId: string;
  publico: boolean;
  ingredientes: PratoIngrediente[];
}

export interface Participante {
  id: string;
  nome: string;
  tipoRefeicao: 'inteira' | 'meia';
}

export interface EventoUsuario {
  id: string;
  eventoId: string;
  usuarioId: string;
  permissao: 'admin' | 'viewer';
  usuario?: Usuario; // Dados populados do usuário
}

export interface Evento {
  id: string;
  nome: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string; // YYYY-MM-DD
  usuarioId: string;
  participantes: Participante[];
  usuariosPermitidos?: EventoUsuario[];
}

export type TipoRefeicao = 'Café da manhã' | 'Almoço' | 'Café da tarde' | 'Janta' | 'Lanche da madrugada';

export interface RefeicaoEventoIngrediente {
  ingredienteId: string;
  quantidade: number;
  unidade: string;
}

export interface Refeicao {
  id: string;
  eventoId: string;
  pratoId: string;
  tipo: TipoRefeicao;
  data: string; // YYYY-MM-DD
  participantesIds: string[]; // references Evento.participantes.id
  ingredientes: RefeicaoEventoIngrediente[];
}
