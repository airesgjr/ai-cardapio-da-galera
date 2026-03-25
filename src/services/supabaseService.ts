import { supabase } from '../lib/supabase';
import { Usuario, Ingrediente, Prato, PratoIngrediente, Evento, Refeicao } from './interface/types';

// ─── Usuários ────────────────────────────────────────────────────────────────

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase.from('usuarios').select('*');
  if (error) throw error;
  return data as Usuario[];
};

export const createUsuario = async (data: Omit<Usuario, 'id'>): Promise<Usuario> => {
  const { data: created, error } = await supabase
    .from('usuarios')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return created as Usuario;
};

export const updateUsuario = async (id: string, data: Partial<Usuario>): Promise<Usuario> => {
  const { data: updated, error } = await supabase
    .from('usuarios')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as Usuario;
};

export const deleteUsuario = async (id: string): Promise<void> => {
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) throw error;
};

// ─── Ingredientes ─────────────────────────────────────────────────────────────

export const getIngredientes = async (usuarioId?: string): Promise<Ingrediente[]> => {
  let query = supabase.from('ingredientes').select('*');
  if (usuarioId) query = query.eq('usuario_id', usuarioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome,
    usuarioId: row.usuario_id,
  }));
};

export const createIngrediente = async (data: Omit<Ingrediente, 'id'>): Promise<Ingrediente> => {
  const { data: created, error } = await supabase
    .from('ingredientes')
    .insert([{ nome: data.nome, usuario_id: data.usuarioId }])
    .select()
    .single();
  if (error) throw error;
  return { id: created.id, nome: created.nome, usuarioId: created.usuario_id };
};

export const updateIngrediente = async (id: string, data: Partial<Ingrediente>): Promise<Ingrediente> => {
  const payload: any = {};
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.usuarioId !== undefined) payload.usuario_id = data.usuarioId;
  const { data: updated, error } = await supabase
    .from('ingredientes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return { id: updated.id, nome: updated.nome, usuarioId: updated.usuario_id };
};

export const deleteIngrediente = async (id: string): Promise<void> => {
  const { error } = await supabase.from('ingredientes').delete().eq('id', id);
  if (error) throw error;
};

// ─── Pratos ───────────────────────────────────────────────────────────────────

export const getPratos = async (usuarioId?: string): Promise<Prato[]> => {
  let query = supabase.from('pratos').select(`
    *,
    prato_ingredientes (
      ingrediente_id,
      quantidade,
      unidade
    )
  `);
  if (usuarioId) query = query.eq('usuario_id', usuarioId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    nome: row.nome,
    usuarioId: row.usuario_id,
    publico: row.publico,
    ingredientes: (row.prato_ingredientes || []).map((pi: any) => ({
      ingredienteId: pi.ingrediente_id,
      quantidade: pi.quantidade,
      unidade: pi.unidade,
    })) as PratoIngrediente[],
  }));
};

export const createPrato = async (data: Omit<Prato, 'id'>): Promise<Prato> => {
  const { data: created, error } = await supabase
    .from('pratos')
    .insert([{ nome: data.nome, usuario_id: data.usuarioId, publico: data.publico }])
    .select()
    .single();
  if (error) throw error;

  if (data.ingredientes.length > 0) {
    const piRows = data.ingredientes.map(pi => ({
      prato_id: created.id,
      ingrediente_id: pi.ingredienteId,
      quantidade: pi.quantidade,
      unidade: pi.unidade,
    }));
    const { error: piError } = await supabase.from('prato_ingredientes').insert(piRows);
    if (piError) throw piError;
  }

  return { id: created.id, nome: created.nome, usuarioId: created.usuario_id, publico: created.publico, ingredientes: data.ingredientes };
};

export const updatePrato = async (id: string, data: Partial<Prato>): Promise<Prato> => {
  const payload: any = {};
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.usuarioId !== undefined) payload.usuario_id = data.usuarioId;
  if (data.publico !== undefined) payload.publico = data.publico;

  const { data: updated, error } = await supabase
    .from('pratos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  if (data.ingredientes !== undefined) {
    await supabase.from('prato_ingredientes').delete().eq('prato_id', id);
    if (data.ingredientes.length > 0) {
      const piRows = data.ingredientes.map(pi => ({
        prato_id: id,
        ingrediente_id: pi.ingredienteId,
        quantidade: pi.quantidade,
        unidade: pi.unidade,
      }));
      const { error: piError } = await supabase.from('prato_ingredientes').insert(piRows);
      if (piError) throw piError;
    }
  }

  const ingredientes = data.ingredientes ?? [];
  return { id: updated.id, nome: updated.nome, usuarioId: updated.usuario_id, publico: updated.publico, ingredientes };
};

export const deletePrato = async (id: string): Promise<void> => {
  await supabase.from('prato_ingredientes').delete().eq('prato_id', id);
  const { error } = await supabase.from('pratos').delete().eq('id', id);
  if (error) throw error;
};

// ─── Eventos ──────────────────────────────────────────────────────────────────

export const getEventos = async (usuarioId: string): Promise<Evento[]> => {
  const { data: meusEventos, error: err1 } = await supabase
    .from('eventos')
    .select(`
      *,
      participantes (id, nome, tipo_refeicao),
      evento_usuarios (id, evento_id, usuario_id, permissao, usuarios (id, nome, email))
    `)
    .eq('usuario_id', usuarioId);
  if (err1) throw err1;

  const { data: compartilhados, error: err2 } = await supabase
    .from('evento_usuarios')
    .select(`
      eventos (
        *,
        participantes (id, nome, tipo_refeicao),
        evento_usuarios (id, evento_id, usuario_id, permissao, usuarios (id, nome, email))
      )
    `)
    .eq('usuario_id', usuarioId);
  if (err2) throw err2;

  const mapEvento = (row: any) => ({
    id: row.id,
    nome: row.nome,
    dataInicio: row.data_inicio,
    dataFim: row.data_fim,
    usuarioId: row.usuario_id,
    participantes: (row.participantes || []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      tipoRefeicao: p.tipo_refeicao,
    })),
    usuariosPermitidos: (row.evento_usuarios || []).map((eu: any) => ({
      id: eu.id,
      eventoId: eu.evento_id,
      usuarioId: eu.usuario_id,
      permissao: eu.permissao,
      usuario: eu.usuarios ? {
        id: eu.usuarios.id,
        nome: eu.usuarios.nome,
        email: eu.usuarios.email,
        cidade: '',
        estado: ''
      } : undefined
    }))
  });

  const allEventos = [...(meusEventos || []).map(mapEvento)];
  (compartilhados || []).forEach((c: any) => {
    if (c.eventos) {
       allEventos.push(mapEvento(c.eventos));
    }
  });

  const uniqueEventos = Array.from(new Map(allEventos.map(e => [e.id, e])).values());
  return uniqueEventos;
};

export const addEventoUsuario = async (eventoId: string, usuarioId: string, permissao: 'admin' | 'viewer') => {
  const { error } = await supabase.from('evento_usuarios').insert([{ evento_id: eventoId, usuario_id: usuarioId, permissao }]);
  if (error) throw error;
};

export const removeEventoUsuario = async (eventoUsuarioId: string) => {
  const { error } = await supabase.from('evento_usuarios').delete().eq('id', eventoUsuarioId);
  if (error) throw error;
};

export const getUsuariosPorEmail = async (emailBusca: string) => {
  const { data, error } = await supabase.from('usuarios').select('id, nome, email').ilike('email', `%${emailBusca}%`).limit(5);
  if (error) throw error;
  return data;
};

export const createEvento = async (data: Omit<Evento, 'id'>): Promise<Evento> => {
  const { data: created, error } = await supabase
    .from('eventos')
    .insert([{ nome: data.nome, data_inicio: data.dataInicio, data_fim: data.dataFim, usuario_id: data.usuarioId }])
    .select()
    .single();
  if (error) throw error;

  if (data.participantes.length > 0) {
    const pRows = data.participantes.map(p => ({
      evento_id: created.id,
      nome: p.nome,
      tipo_refeicao: p.tipoRefeicao,
    }));
    const { error: pError } = await supabase.from('participantes').insert(pRows);
    if (pError) throw pError;
  }

  return { id: created.id, nome: created.nome, dataInicio: created.data_inicio, dataFim: created.data_fim, usuarioId: created.usuario_id, participantes: data.participantes };
};

export const updateEvento = async (id: string, data: Partial<Evento>): Promise<Evento> => {
  const payload: any = {};
  if (data.nome !== undefined) payload.nome = data.nome;
  if (data.dataInicio !== undefined) payload.data_inicio = data.dataInicio;
  if (data.dataFim !== undefined) payload.data_fim = data.dataFim;
  if (data.usuarioId !== undefined) payload.usuario_id = data.usuarioId;

  const { data: updated, error } = await supabase
    .from('eventos')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  if (data.participantes !== undefined) {
    await supabase.from('participantes').delete().eq('evento_id', id);
    if (data.participantes.length > 0) {
      const pRows = data.participantes.map(p => ({
        evento_id: id,
        nome: p.nome,
        tipo_refeicao: p.tipoRefeicao,
      }));
      const { error: pError } = await supabase.from('participantes').insert(pRows);
      if (pError) throw pError;
    }
  }

  const participantes = data.participantes ?? [];
  return { id: updated.id, nome: updated.nome, dataInicio: updated.data_inicio, dataFim: updated.data_fim, usuarioId: updated.usuario_id, participantes };
};

export const deleteEvento = async (id: string): Promise<void> => {
  await supabase.from('participantes').delete().eq('evento_id', id);
  await supabase.from('refeicoes').delete().eq('evento_id', id);
  const { error } = await supabase.from('eventos').delete().eq('id', id);
  if (error) throw error;
};

// ─── Refeições ────────────────────────────────────────────────────────────────

export const getRefeicoes = async (eventoId?: string): Promise<Refeicao[]> => {
  let query = supabase.from('refeicoes').select(`
    *,
    refeicao_ingredientes (
      ingrediente_id,
      quantidade,
      unidade
    )
  `);
  if (eventoId) query = query.eq('evento_id', eventoId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    eventoId: row.evento_id,
    pratoId: row.prato_id,
    tipo: row.tipo,
    data: row.data,
    participantesIds: row.participantes_ids || [],
    ingredientes: (row.refeicao_ingredientes || []).map((ri: any) => ({
      ingredienteId: ri.ingrediente_id,
      quantidade: ri.quantidade,
      unidade: ri.unidade,
    })),
  }));
};

export const createRefeicao = async (data: Omit<Refeicao, 'id'>): Promise<Refeicao> => {
  const { data: created, error } = await supabase
    .from('refeicoes')
    .insert([{
      evento_id: data.eventoId,
      prato_id: data.pratoId,
      tipo: data.tipo,
      data: data.data,
      participantes_ids: data.participantesIds,
    }])
    .select()
    .single();
  if (error) throw error;

  if (data.ingredientes.length > 0) {
    const riRows = data.ingredientes.map(ri => ({
      refeicao_id: created.id,
      ingrediente_id: ri.ingredienteId,
      quantidade: ri.quantidade,
      unidade: ri.unidade,
    }));
    const { error: riError } = await supabase.from('refeicao_ingredientes').insert(riRows);
    if (riError) throw riError;
  }

  return { id: created.id, eventoId: created.evento_id, pratoId: created.prato_id, tipo: created.tipo, data: created.data, participantesIds: created.participantes_ids || [], ingredientes: data.ingredientes };
};

export const updateRefeicao = async (id: string, data: Partial<Refeicao>): Promise<Refeicao> => {
  const payload: any = {};
  if (data.eventoId !== undefined) payload.evento_id = data.eventoId;
  if (data.pratoId !== undefined) payload.prato_id = data.pratoId;
  if (data.tipo !== undefined) payload.tipo = data.tipo;
  if (data.data !== undefined) payload.data = data.data;
  if (data.participantesIds !== undefined) payload.participantes_ids = data.participantesIds;

  let updated;
  if (Object.keys(payload).length > 0) {
    const { data, error } = await supabase
      .from('refeicoes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    updated = data;
  } else {
    const { data, error } = await supabase
      .from('refeicoes')
      .select()
      .eq('id', id)
      .single();
    if (error) throw error;
    updated = data;
  }

  if (data.ingredientes !== undefined) {
    await supabase.from('refeicao_ingredientes').delete().eq('refeicao_id', id);
    if (data.ingredientes.length > 0) {
      const riRows = data.ingredientes.map(ri => ({
        refeicao_id: id,
        ingrediente_id: ri.ingredienteId,
        quantidade: ri.quantidade,
        unidade: ri.unidade,
      }));
      const { error: riError } = await supabase.from('refeicao_ingredientes').insert(riRows);
      if (riError) throw riError;
    }
  }

  const ingredientes = data.ingredientes ?? [];
  return { id: updated.id, eventoId: updated.evento_id, pratoId: updated.prato_id, tipo: updated.tipo, data: updated.data, participantesIds: updated.participantes_ids || [], ingredientes };
};

export const deleteRefeicao = async (id: string): Promise<void> => {
  await supabase.from('refeicao_ingredientes').delete().eq('refeicao_id', id);
  const { error } = await supabase.from('refeicoes').delete().eq('id', id);
  if (error) throw error;
};

// ─── Ingredientes de Evento ───────────────────────────────────────────────────

export const getIngredientesEventos = async (eventoId: string) => {
  const { data, error } = await supabase
    .from('refeicao_ingredientes')
    .select(`
      ingrediente_id,
      quantidade,
      unidade,
      refeicoes!inner (
        evento_id
      )
    `)
    .eq('refeicoes.evento_id', eventoId);
  if (error) throw error;
  return data || [];
};
