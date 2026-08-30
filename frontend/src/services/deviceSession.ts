import { User, Tenant } from '../types/index.js';

export interface DeviceSession {
  userId: string;
  nome: string;
  email: string;
  nomeConstrutora: string;
  perfil: 'ADMIN' | 'ENGENHEIRO' | 'MESTRE_OBRA';
  telefoneWhatsapp?: string;
  savedAt: string;
  lastToken?: string;
}

const DEVICE_SESSION_KEY = 'erp_obras_device_session';

export const deviceSessionService = {
  /**
   * Salva os dados públicos do perfil da última sessão neste aparelho
   */
  saveSession(user: User, tenant: Tenant, token?: string | null): void {
    try {
      const sessionData: DeviceSession = {
        userId: user.id,
        nome: user.nome,
        email: user.email,
        nomeConstrutora: tenant.nome_fantasia,
        perfil: user.perfil,
        telefoneWhatsapp: user.telefone_whatsapp,
        savedAt: new Date().toISOString(),
        lastToken: token || undefined
      };
      localStorage.setItem(DEVICE_SESSION_KEY, JSON.stringify(sessionData));
    } catch (err) {
      console.warn('Não foi possível salvar a sessão no dispositivo:', err);
    }
  },

  /**
   * Recupera a última sessão salva neste aparelho
   */
  getSession(): DeviceSession | null {
    try {
      const raw = localStorage.getItem(DEVICE_SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as DeviceSession;
    } catch (err) {
      console.warn('Erro ao ler sessão do dispositivo:', err);
      return null;
    }
  },

  /**
   * Remove a memória do aparelho (esquecer dispositivo)
   */
  clearSession(): void {
    try {
      localStorage.removeItem(DEVICE_SESSION_KEY);
    } catch (err) {
      console.warn('Erro ao limpar sessão do dispositivo:', err);
    }
  },

  /**
   * Verifica se há uma sessão salva
   */
  hasSession(): boolean {
    return Boolean(localStorage.getItem(DEVICE_SESSION_KEY));
  }
};
