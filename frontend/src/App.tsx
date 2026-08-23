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
import { LoginPage } from './pages/LoginPage.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { FluxoCaixaPage } from './pages/FluxoCaixaPage.js';
import { InadimplenciaPage } from './pages/InadimplenciaPage.js';
import { SinapiOrcamentosPage } from './pages/SinapiOrcamentosPage.js';
import { DiarioObrasPage } from './pages/DiarioObrasPage.js';
import { MobileFieldPage } from './pages/MobileFieldPage.js';
import { NewObraModal } from './components/NewObraModal.js';

const AppLayout: React.FC = () => {
  const { refreshObras } = useAuth();
  const [newObraModalOpen, setNewObraModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar para desktop */}
      <Sidebar openNewObraModal={() => setNewObraModalOpen(true)} />

      <div className="main-content">
        <Navbar openNewObraModal={() => setNewObraModalOpen(true)} />

        <main style={{ flex: 1 }}>
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
  );
};

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-dark)',
          color: 'var(--text-muted)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ width: '16px', height: '16px', marginBottom: '12px' }} />
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Carregando ERP Leve de Obras...</p>
        </div>
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
        <BrowserRouter>
          <Routes>
            {/* Rota Pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/fluxo" element={<FluxoCaixaPage />} />
              <Route path="/inadimplencia" element={<InadimplenciaPage />} />
              <Route path="/sinapi" element={<SinapiOrcamentosPage />} />
              <Route path="/diario" element={<DiarioObrasPage />} />
              <Route path="/campo" element={<MobileFieldPage />} />
              <Route path="/field" element={<Navigate to="/campo" replace />} />
            </Route>

            {/* Rota Coringa / Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
