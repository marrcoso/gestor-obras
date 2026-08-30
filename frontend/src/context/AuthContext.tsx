import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Tenant, Obra, BillingOverview, RegisterPayload } from '../types/index.js';
import { api } from '../services/api.js';
import { deviceSessionService, DeviceSession } from '../services/deviceSession.js';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  selectedObra: Obra | null;
  obras: Obra[];
  billingOverview: BillingOverview | null;
  loading: boolean;
  isOnline: boolean;
  login: (email: string, pass: string, rememberDevice?: boolean) => Promise<void>;
  register: (payload: RegisterPayload, rememberDevice?: boolean) => Promise<void>;
  quickResumeSession: (session: DeviceSession) => Promise<void>;
  loginDemo: (perfil: 'ADMIN' | 'MESTRE_OBRA') => Promise<void>;
  logout: () => void;
  setSelectedObra: (obra: Obra | null) => void;
  refreshObras: () => Promise<void>;
  refreshBilling: () => Promise<void>;
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
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
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
    const existingToken = api.getToken();
    if (existingToken) {
      Promise.all([
        api.me(),
        api.getObras().catch(() => []),
        api.getBillingOverview().catch(() => null)
      ])
        .then(([{ user, tenant }, obrasData, billingData]) => {
          setUser(user);
          setTenant(tenant);
          setObras(obrasData);
          if (obrasData.length > 0) {
            setSelectedObra(obrasData[0]);
          }
          if (billingData) {
            setBillingOverview(billingData);
          }
          // Atualiza dados de sessão do aparelho
          deviceSessionService.saveSession(user, tenant, existingToken);
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

  const refreshBilling = async () => {
    try {
      const data = await api.getBillingOverview();
      setBillingOverview(data);
    } catch (e) {
      console.error('Erro ao atualizar dados de billing:', e);
    }
  };

  const login = async (email: string, pass: string, rememberDevice = true) => {
    setLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setTenant(res.tenant);

      if (rememberDevice) {
        deviceSessionService.saveSession(res.user, res.tenant, res.token);
      }

      const [obrasData, billingData] = await Promise.all([
        api.getObras().catch(() => []),
        api.getBillingOverview().catch(() => null)
      ]);
      setObras(obrasData);
      if (obrasData.length > 0) setSelectedObra(obrasData[0]);
      if (billingData) setBillingOverview(billingData);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload, rememberDevice = true) => {
    setLoading(true);
    try {
      const res = await api.register(payload);
      setUser(res.user);
      setTenant(res.tenant);

      if (rememberDevice) {
        deviceSessionService.saveSession(res.user, res.tenant, res.token);
      }

      const [obrasData, billingData] = await Promise.all([
        api.getObras().catch(() => []),
        api.getBillingOverview().catch(() => null)
      ]);
      setObras(obrasData);
      if (obrasData.length > 0) setSelectedObra(obrasData[0]);
      if (billingData) setBillingOverview(billingData);
    } finally {
      setLoading(false);
    }
  };

  const quickResumeSession = async (session: DeviceSession) => {
    setLoading(true);
    try {
      if (session.lastToken) {
        api.setToken(session.lastToken);
      }
      const [{ user, tenant }, obrasData, billingData] = await Promise.all([
        api.me(),
        api.getObras().catch(() => []),
        api.getBillingOverview().catch(() => null)
      ]);
      setUser(user);
      setTenant(tenant);
      setObras(obrasData);
      if (obrasData.length > 0) setSelectedObra(obrasData[0]);
      if (billingData) setBillingOverview(billingData);
      deviceSessionService.saveSession(user, tenant, api.getToken());
    } catch (err) {
      // Se o token expirou, desloga e mantém a sessão local para pedir senha
      api.setToken(null);
      throw new Error('Sessão expirada. Por favor, insira sua senha para reativar o acesso.');
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (perfil: 'ADMIN' | 'MESTRE_OBRA') => {
    const email = perfil === 'ADMIN' ? 'admin@alfaengenharia.com' : 'mestre@alfaengenharia.com';
    await login(email, 'senha123', true);
  };

  const refreshUser = async () => {
    try {
      const data = await api.me();
      setUser(data.user);
      setTenant(data.tenant);
      refreshBilling();
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
    setBillingOverview(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        selectedObra,
        obras,
        billingOverview,
        loading,
        isOnline,
        login,
        register,
        quickResumeSession,
        loginDemo,
        logout,
        setSelectedObra,
        refreshObras,
        refreshBilling,
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

