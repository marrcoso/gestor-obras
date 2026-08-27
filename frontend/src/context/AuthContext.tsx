import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, Obra } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  selectedObra: Obra | null;
  obras: Obra[];
  loading: boolean;
  isOnline: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: (perfil: 'ADMIN' | 'MESTRE_OBRA') => Promise<void>;
  logout: () => void;
  setSelectedObra: (obra: Obra | null) => void;
  refreshObras: () => Promise<void>;
  updateUser: (user: User) => void;
  updateTenant: (tenant: Tenant) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      api.flushOfflineQueue().then((count) => {
        if (count > 0) {
          console.log(`[Offline Sync] ${count} ações sincronizadas com sucesso!`);
          refreshObras();
        }
      });
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Checa sessão existente
    if (api.getToken()) {
      api.me()
        .then(({ user, tenant }) => {
          setUser(user);
          setTenant(tenant);
          return api.getObras();
        })
        .then((obrasData) => {
          setObras(obrasData);
          if (obrasData.length > 0) {
            setSelectedObra(obrasData[0]);
          }
        })
        .catch(() => {
          api.setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshObras = async () => {
    try {
      const data = await api.getObras();
      setObras(data);
      if (selectedObra) {
        const updated = data.find((o) => o.id === selectedObra.id);
        if (updated) setSelectedObra(updated);
      } else if (data.length > 0) {
        setSelectedObra(data[0]);
      }
    } catch (e) {
      console.error('Erro ao atualizar obras:', e);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setTenant(res.tenant);
      const obrasData = await api.getObras();
      setObras(obrasData);
      if (obrasData.length > 0) setSelectedObra(obrasData[0]);
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (perfil: 'ADMIN' | 'MESTRE_OBRA') => {
    const email = perfil === 'ADMIN' ? 'admin@alfaengenharia.com' : 'mestre@alfaengenharia.com';
    await login(email, 'senha123');
  };

  const refreshUser = async () => {
    try {
      const data = await api.me();
      setUser(data.user);
      setTenant(data.tenant);
    } catch (e) {
      console.error('Erro ao atualizar dados do usuário:', e);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setTenant(null);
    setObras([]);
    setSelectedObra(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        selectedObra,
        obras,
        loading,
        isOnline,
        login,
        loginDemo,
        logout,
        setSelectedObra,
        refreshObras,
        updateUser: (u) => setUser(u),
        updateTenant: (t) => setTenant(t),
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
