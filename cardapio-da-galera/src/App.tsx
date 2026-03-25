/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ingredientes from './pages/Ingredientes';
import Pratos from './pages/Pratos';
import PratoForm from './pages/PratoForm';
import Eventos from './pages/Eventos';
import EventoForm from './pages/EventoForm';
import EventoDetalhes from './pages/EventoDetalhes';
import RefeicaoForm from './pages/RefeicaoForm';
import ListaCompras from './pages/ListaCompras';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="ingredientes" element={<Ingredientes />} />
            <Route path="pratos" element={<Pratos />} />
            <Route path="pratos/novo" element={<PratoForm />} />
            <Route path="pratos/:id" element={<PratoForm />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="eventos/novo" element={<EventoForm />} />
            <Route path="eventos/:id" element={<EventoDetalhes />} />
            <Route path="eventos/:id/refeicoes/nova" element={<RefeicaoForm />} />
            <Route path="eventos/:id/refeicoes/:refeicaoId" element={<RefeicaoForm />} />
            <Route path="eventos/:id/compras" element={<ListaCompras />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

