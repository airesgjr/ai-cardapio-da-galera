import { Usuario, Ingrediente, Prato, Evento, Refeicao } from './interface/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = () => crypto.randomUUID();

// Usuarios
export const getUsuarios = async (): Promise<Usuario[]> => {
  await delay(100);
  return getStorage<Usuario>('usuarios');
};

export const createUsuario = async (data: Omit<Usuario, 'id'>): Promise<Usuario> => {
  await delay(100);
  const usuarios = getStorage<Usuario>('usuarios');
  const novo = { ...data, id: generateId() };
  setStorage('usuarios', [...usuarios, novo]);
  return novo;
};

export const updateUsuario = async (id: string, data: Partial<Usuario>): Promise<Usuario> => {
  await delay(100);
  const usuarios = getStorage<Usuario>('usuarios');
  const index = usuarios.findIndex(u => u.id === id);
  if (index === -1) throw new Error('Usuário não encontrado');
  usuarios[index] = { ...usuarios[index], ...data };
  setStorage('usuarios', usuarios);
  return usuarios[index];
};

export const deleteUsuario = async (id: string): Promise<void> => {
  await delay(100);
  const usuarios = getStorage<Usuario>('usuarios');
  setStorage('usuarios', usuarios.filter(u => u.id !== id));
};

// Ingredientes
export const getIngredientes = async (): Promise<Ingrediente[]> => {
  await delay(100);
  return getStorage<Ingrediente>('ingredientes');
};

export const createIngrediente = async (data: Omit<Ingrediente, 'id'>): Promise<Ingrediente> => {
  await delay(100);
  const ingredientes = getStorage<Ingrediente>('ingredientes');
  if (ingredientes.some(i => i.nome.toLowerCase() === data.nome.toLowerCase())) {
    throw new Error('Ingrediente já cadastrado');
  }
  const novo = { ...data, id: generateId() };
  setStorage('ingredientes', [...ingredientes, novo]);
  return novo;
};

export const updateIngrediente = async (id: string, data: Partial<Ingrediente>): Promise<Ingrediente> => {
  await delay(100);
  const ingredientes = getStorage<Ingrediente>('ingredientes');
  const index = ingredientes.findIndex(i => i.id === id);
  if (index === -1) throw new Error('Ingrediente não encontrado');
  
  if (data.nome) {
    const exists = ingredientes.some(i => i.id !== id && i.nome.toLowerCase() === data.nome!.toLowerCase());
    if (exists) throw new Error('Ingrediente já cadastrado com este nome');
  }

  ingredientes[index] = { ...ingredientes[index], ...data };
  setStorage('ingredientes', ingredientes);
  return ingredientes[index];
};

export const deleteIngrediente = async (id: string): Promise<void> => {
  await delay(100);
  const ingredientes = getStorage<Ingrediente>('ingredientes');
  setStorage('ingredientes', ingredientes.filter(i => i.id !== id));
};

// Pratos
export const getPratos = async (): Promise<Prato[]> => {
  await delay(100);
  return getStorage<Prato>('pratos');
};

export const createPrato = async (data: Omit<Prato, 'id'>): Promise<Prato> => {
  await delay(100);
  const pratos = getStorage<Prato>('pratos');
  const novo = { ...data, id: generateId() };
  setStorage('pratos', [...pratos, novo]);
  return novo;
};

export const updatePrato = async (id: string, data: Partial<Prato>): Promise<Prato> => {
  await delay(100);
  const pratos = getStorage<Prato>('pratos');
  const index = pratos.findIndex(p => p.id === id);
  if (index === -1) throw new Error('Prato não encontrado');
  pratos[index] = { ...pratos[index], ...data };
  setStorage('pratos', pratos);
  return pratos[index];
};

export const deletePrato = async (id: string): Promise<void> => {
  await delay(100);
  const pratos = getStorage<Prato>('pratos');
  setStorage('pratos', pratos.filter(p => p.id !== id));
};

// Eventos
export const getEventos = async (): Promise<Evento[]> => {
  await delay(100);
  return getStorage<Evento>('eventos');
};

export const createEvento = async (data: Omit<Evento, 'id'>): Promise<Evento> => {
  await delay(100);
  const eventos = getStorage<Evento>('eventos');
  const novo = { ...data, id: generateId() };
  setStorage('eventos', [...eventos, novo]);
  return novo;
};

export const updateEvento = async (id: string, data: Partial<Evento>): Promise<Evento> => {
  await delay(100);
  const eventos = getStorage<Evento>('eventos');
  const index = eventos.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Evento não encontrado');
  eventos[index] = { ...eventos[index], ...data };
  setStorage('eventos', eventos);
  return eventos[index];
};

export const deleteEvento = async (id: string): Promise<void> => {
  await delay(100);
  const eventos = getStorage<Evento>('eventos');
  setStorage('eventos', eventos.filter(e => e.id !== id));
};

// Refeições
export const getRefeicoes = async (): Promise<Refeicao[]> => {
  await delay(100);
  return getStorage<Refeicao>('refeicoes');
};

export const createRefeicao = async (data: Omit<Refeicao, 'id'>): Promise<Refeicao> => {
  await delay(100);
  const refeicoes = getStorage<Refeicao>('refeicoes');
  const novo = { ...data, id: generateId() };
  setStorage('refeicoes', [...refeicoes, novo]);
  return novo;
};

export const updateRefeicao = async (id: string, data: Partial<Refeicao>): Promise<Refeicao> => {
  await delay(100);
  const refeicoes = getStorage<Refeicao>('refeicoes');
  const index = refeicoes.findIndex(r => r.id === id);
  if (index === -1) throw new Error('Refeição não encontrada');
  refeicoes[index] = { ...refeicoes[index], ...data };
  setStorage('refeicoes', refeicoes);
  return refeicoes[index];
};

export const deleteRefeicao = async (id: string): Promise<void> => {
  await delay(100);
  const refeicoes = getStorage<Refeicao>('refeicoes');
  setStorage('refeicoes', refeicoes.filter(r => r.id !== id));
};

// Helper for shopping list
export const getIngredientesEventos = async (eventoId: string) => {
  await delay(100);
  const refeicoes = getStorage<Refeicao>('refeicoes').filter(r => r.eventoId === eventoId);
  return refeicoes;
};
