import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { NotificationToast } from './components/notifications/NotificationToast.js';
import { SubscriptionBanner } from './components/billing/SubscriptionBanner.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { FluxoCaixaPage } from './pages/FluxoCaixaPage.js';
import { InadimplenciaPage } from './pages/InadimplenciaPage.js';
import { SinapiOrcamentosPage } from './pages/SinapiOrcamentosPage.js';
import { DiarioObrasPage } from './pages/DiarioObrasPage.js';
import { MobileFieldPage } from './pages/MobileFieldPage.js';
import { UsuarioPage } from './pages/UsuarioPage.js';
import { PlanosPage } from './pages/PlanosPage.js';
import { NewObraModal } from './components/NewObraModal.js';
import { LoadingState } from './components/ui/LoadingState.js';

const AppLayout: React.FC = () => {
  const { refreshObras } = useAuth();
  const [newObraModalOpen, setNewObraModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-app flex-col overflow-hidden">
      {/* Banner Global de Assinatura & Trial */}
      <SubscriptionBanner />

      <div className="flex flex-1 min-h-0 relative">
        {/* Toast Flutuante de Notificações */}
        <NotificationToast />

        {/* Sidebar para desktop */}
        <Sidebar openNewObraModal={() => setNewObraModalOpen(true)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-20 lg:pb-8">
          <Navbar openNewObraModal={() => setNewObraModalOpen(true)} />

          <main className="flex-1">
            <Outlet context={{ openNewObraModal: () => setNewObraModalOpen(true) }} />
          </main>

          {/* Bottom Nav móvel */}
          <MobileBottomNav />

          {/* Modal Global de Cadastro de Obra */}
          <NewObraModal
            isOpen={newObraModalOpen}
            onClose={() => setNewObraModalOpen(false)}
            onSuccess={() => refreshObras()}
          />
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <LoadingState message="Carregando ERP Leve de Obras..." minHeight="200px" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.perfil === 'MESTRE_OBRA') {
    return <Navigate to="/campo" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />
              <Route path="/register" element={<Navigate to="/cadastro" replace />} />

              {/* Rotas Protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/fluxo" element={<FluxoCaixaPage />} />
                <Route path="/inadimplencia" element={<InadimplenciaPage />} />
                <Route path="/sinapi" element={<SinapiOrcamentosPage />} />
                <Route path="/diario" element={<DiarioObrasPage />} />
                <Route path="/planos" element={<PlanosPage />} />
                <Route path="/billing" element={<Navigate to="/planos" replace />} />
                <Route path="/usuario" element={<UsuarioPage />} />
                <Route path="/perfil" element={<Navigate to="/usuario" replace />} />
                <Route path="/settings" element={<Navigate to="/usuario" replace />} />
                <Route path="/campo" element={<MobileFieldPage />} />
                <Route path="/field" element={<Navigate to="/campo" replace />} />
              </Route>

              {/* Rota Coringa / Fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
