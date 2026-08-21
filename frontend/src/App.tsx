import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
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

const MainApp: React.FC = () => {
  const { user, loading, refreshObras } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [newObraModalOpen, setNewObraModalOpen] = useState(false);

  useEffect(() => {
    if (user?.perfil === 'MESTRE_OBRA') {
      setCurrentView('field');
    }
  }, [user]);

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
          <p style={{ fontSize: '14px', fontWeight: 600 }}>Carregando ERP Leve de Obras...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar para desktop */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openNewObraModal={() => setNewObraModalOpen(true)}
      />

      <div className="main-content">
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />

        <main style={{ flex: 1 }}>
          {currentView === 'dashboard' && (
            <DashboardPage
              setCurrentView={setCurrentView}
              openNewObraModal={() => setNewObraModalOpen(true)}
            />
          )}
          {currentView === 'fluxo' && <FluxoCaixaPage />}
          {currentView === 'inadimplencia' && <InadimplenciaPage />}
          {currentView === 'sinapi' && <SinapiOrcamentosPage />}
          {currentView === 'diario' && <DiarioObrasPage />}
          {currentView === 'field' && <MobileFieldPage />}
        </main>

        {/* Bottom Nav móvel */}
        <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />

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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
