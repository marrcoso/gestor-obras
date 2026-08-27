import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notificacao } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { offlineQueue } from '../services/offlineQueue.js';
import { api } from '../services/api.js';

interface NotificationContextType {
  notificacoes: Notificacao[];
  unreadCount: number;
  activeToast: Notificacao | null;
  addNotification: (notif: Omit<Notificacao, 'id' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissNotification: (id: string) => void;
  clearToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, obras } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [activeToast, setActiveToast] = useState<Notificacao | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Gera alertas rápidos em memória ao carregar a sessão / dados do usuário
  const generateLiveAlerts = useCallback(async () => {
    if (!user) return;

    const inMemoryNotifs: Notificacao[] = [];
    const now = new Date().toISOString();

    // 1. Alerta de Inadimplência (Busca rápida do radar de recebíveis)
    try {
      const radar = await api.getInadimplenciaRadar();
      if (radar && radar.total_vencido > 0) {
        inMemoryNotifs.push({
          id: 'mem-inad-1',
          tipo: 'INADIMPLENCIA',
          prioridade: 'URGENTE',
          titulo: 'Parcelas em Atraso Identificadas',
          mensagem: `Existem ${radar.inadimplentes.length} recebimentos vencidos totalizando ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(radar.total_vencido)}.`,
          link_acao: '/inadimplencia',
          lida: false,
          created_at: now
        });
      }
    } catch {
      // Falha silenciosa caso offline
    }

    // 2. Alertas de Limite Orçamentário de Obras (>85%)
    (obras || []).forEach((obra) => {
      const despesas = obra.total_despesas || 0;
      if (obra.orcamento_previsto > 0) {
        const pct = despesas / obra.orcamento_previsto;
        if (pct >= 0.85) {
          inMemoryNotifs.push({
            id: `mem-orcamento-${obra.id}`,
            tipo: 'ORCAMENTO_LIMITE',
            prioridade: pct >= 1 ? 'URGENTE' : 'ALTA',
            titulo: pct >= 1 ? `Orçamento Estourado: ${obra.nome}` : `Atenção ao Orçamento: ${obra.nome}`,
            mensagem: `Obra consumiu ${(pct * 100).toFixed(0)}% do orçamento previsto (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesas)}).`,
            link_acao: '/dashboard',
            lida: false,
            created_at: now
          });
        }
      }
    });

    // 3. Fila Offline
    const pendingOffline = offlineQueue.count();
    if (pendingOffline > 0) {
      inMemoryNotifs.push({
        id: 'mem-offline-sync',
        tipo: 'OFFLINE_SYNC',
        prioridade: 'MEDIA',
        titulo: 'Itens Pendentes de Sincronização',
        mensagem: `Você possui ${pendingOffline} ação(ões) gravadas localmente aguardando conexão.`,
        link_acao: '/campo',
        lida: false,
        created_at: now
      });
    }

    // 4. Notificação de Boas-Vindas
    inMemoryNotifs.push({
      id: 'mem-welcome',
      tipo: 'SISTEMA',
      prioridade: 'BAIXA',
      titulo: 'Sessão Ativa no ERP Leve',
      mensagem: `Bem-vindo de volta, ${user.nome.split(' ')[0]}. Todos os módulos operacionais estão prontos.`,
      link_acao: '/dashboard',
      lida: true,
      created_at: now
    });

    setNotificacoes(inMemoryNotifs);
    setInitialized(true);
  }, [user, obras]);

  useEffect(() => {
    if (user && !initialized) {
      generateLiveAlerts();
    } else if (!user) {
      setNotificacoes([]);
      setInitialized(false);
    }
  }, [user, initialized, generateLiveAlerts]);

  const addNotification = (notif: Omit<Notificacao, 'id' | 'created_at'>) => {
    const newNotif: Notificacao = {
      ...notif,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      lida: false,
      created_at: new Date().toISOString()
    };
    setNotificacoes((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);
  };

  const markAsRead = (id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const clearAll = () => {
    setNotificacoes([]);
    setActiveToast(null);
  };

  const dismissNotification = (id: string) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
  };

  const clearToast = () => setActiveToast(null);

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  return (
    <NotificationContext.Provider
      value={{
        notificacoes,
        unreadCount,
        activeToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        dismissNotification,
        clearToast
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser utilizado dentro de um NotificationProvider');
  }
  return context;
};
