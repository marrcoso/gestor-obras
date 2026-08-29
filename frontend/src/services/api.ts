import {
  Obra,
  TransacaoFinanceira,
  FluxoResumo,
  ContaReceber,
  InadimplenciaRadarData,
  SinapiItem,
  Orcamento,
  DiarioFoto,
  User,
  Tenant,
  Notificacao,
  ActivityLog,
  TeamMember,
  Subscription,
  Invoice,
  BillingOverview,
  CheckoutPayload
} from '../types/index.js';
import { offlineQueue } from './offlineQueue.js';

const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('erp_obras_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('erp_obras_token', token);
    } else {
      localStorage.removeItem('erp_obras_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>)
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      // Se houver falha de rede e a rota for uma criação de campo, enfileira offline
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('OFFLINE_NETWORK_ERROR');
      }
      throw err;
    }
  }

  // --- AUTH ---
  public async login(email: string, senha: string): Promise<{ token: string; user: User; tenant: Tenant }> {
    const res = await this.request<{ token: string; user: User; tenant: Tenant }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha })
    });
    this.setToken(res.token);
    return res;
  }

  public async register(payload: {
    nomeConstrutora: string;
    nomeUsuario: string;
    email: string;
    senha: string;
    telefoneWhatsapp?: string;
  }): Promise<{ token: string; user: User; tenant: Tenant }> {
    const res = await this.request<{ token: string; user: User; tenant: Tenant }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async me(): Promise<{ user: User; tenant: Tenant }> {
    return this.request<{ user: User; tenant: Tenant }>('/auth/me');
  }

  // --- OBRAS ---
  public async getObras(status?: string): Promise<Obra[]> {
    const query = status ? `?status=${status}` : '';
    return this.request<Obra[]>(`/obras${query}`);
  }

  public async getObraById(id: string): Promise<Obra> {
    return this.request<Obra>(`/obras/${id}`);
  }

  public async createObra(data: Partial<Obra> & { clienteNome: string; dataInicio: string }): Promise<Obra> {
    return this.request<Obra>('/obras', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- TRANSAÇÕES (FLUXO DE CAIXA) ---
  public async getTransacoes(filters: {
    obraId?: string;
    tipo?: string;
    categoria?: string;
    status?: string;
  } = {}): Promise<TransacaoFinanceira[]> {
    const params = new URLSearchParams();
    if (filters.obraId) params.append('obraId', filters.obraId);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.categoria) params.append('categoria', filters.categoria);
    if (filters.status) params.append('status', filters.status);

    return this.request<TransacaoFinanceira[]>(`/transacoes?${params.toString()}`);
  }

  public async getFluxoResumo(obraId?: string): Promise<FluxoResumo> {
    const query = obraId ? `?obraId=${obraId}` : '';
    return this.request<FluxoResumo>(`/transacoes/resumo${query}`);
  }

  public async createTransacao(data: any): Promise<TransacaoFinanceira> {
    try {
      return await this.request<TransacaoFinanceira>('/transacoes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'OFFLINE_NETWORK_ERROR') {
        offlineQueue.add('TRANSACTION', data);
        return {
          id: 'temp-' + Date.now(),
          tenant_id: 'offline',
          obra_id: data.obraId,
          tipo: data.tipo || 'DESPESA',
          categoria: data.categoria,
          descricao: data.descricao + ' (Pendente de Sincronização)',
          valor: data.valor,
          data_competencia: new Date().toISOString().split('T')[0],
          data_vencimento: new Date().toISOString().split('T')[0],
          status: 'PENDENTE',
          origem_lancamento: 'MOBILE',
          created_at: new Date().toISOString()
        } as any;
      }
      throw err;
    }
  }

  public async updateTransacaoStatus(id: string, status: 'PAGO' | 'PENDENTE'): Promise<TransacaoFinanceira> {
    return this.request<TransacaoFinanceira>(`/transacoes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // --- CONTAS A RECEBER / INADIMPLÊNCIA ---
  public async getContasReceber(obraId?: string): Promise<ContaReceber[]> {
    const query = obraId ? `?obraId=${obraId}` : '';
    return this.request<ContaReceber[]>(`/contas-receber${query}`);
  }

  public async getInadimplenciaRadar(): Promise<InadimplenciaRadarData> {
    return this.request<InadimplenciaRadarData>('/contas-receber/radar');
  }

  public async getWhatsappCobrancaMessage(id: string): Promise<{ mensagem: string; whatsapp_url: string | null; telefone?: string }> {
    return this.request<{ mensagem: string; whatsapp_url: string | null; telefone?: string }>(`/contas-receber/${id}/whatsapp-cobranca`);
  }

  public async marcarContaRecebida(id: string): Promise<any> {
    return this.request<any>(`/contas-receber/${id}/receber`, {
      method: 'PATCH'
    });
  }

  public async createContaReceber(data: any): Promise<ContaReceber> {
    return this.request<ContaReceber>('/contas-receber', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- SINAPI & ORÇAMENTOS ---
  public async searchSinapi(q: string, uf: string = 'SP'): Promise<{ total: number; data: SinapiItem[] }> {
    return this.request<{ total: number; data: SinapiItem[] }>(`/sinapi/search?q=${encodeURIComponent(q)}&uf=${uf}`);
  }

  public async getOrcamentos(obraId?: string): Promise<Orcamento[]> {
    const query = obraId ? `?obraId=${obraId}` : '';
    return this.request<Orcamento[]>(`/orcamentos${query}`);
  }

  public async getOrcamentoById(id: string): Promise<Orcamento> {
    return this.request<Orcamento>(`/orcamentos/${id}`);
  }

  public async createOrcamento(data: { obraId: string; titulo: string; bdiPadraoPercentual?: number }): Promise<Orcamento> {
    return this.request<Orcamento>('/orcamentos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async addOrcamentoItem(orcamentoId: string, item: any): Promise<any> {
    return this.request<any>(`/orcamentos/${orcamentoId}/itens`, {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  // --- DIÁRIO DE OBRA ---
  public async getDiarioFotos(obraId?: string, etapa?: string): Promise<DiarioFoto[]> {
    const params = new URLSearchParams();
    if (obraId) params.append('obraId', obraId);
    if (etapa) params.append('etapa', etapa);
    return this.request<DiarioFoto[]>(`/diario?${params.toString()}`);
  }

  public async createDiarioFoto(data: any): Promise<DiarioFoto> {
    try {
      return await this.request<DiarioFoto>('/diario', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err: any) {
      if (err.message === 'OFFLINE_NETWORK_ERROR') {
        offlineQueue.add('DIARIO_PHOTO', data);
        return {
          id: 'temp-foto-' + Date.now(),
          tenant_id: 'offline',
          obra_id: data.obraId,
          foto_url: data.fotoUrl,
          etapa: data.etapa,
          descricao: data.descricao + ' (Pendente de Sincronização)',
          data_registro: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        };
      }
      throw err;
    }
  }

  public async getClientReport(obraId: string): Promise<any> {
    return this.request<any>(`/diario/relatorio-cliente/${obraId}`);
  }

  // --- UPLOAD ---
  public async uploadFile(file: File, subfolder: 'comprovantes' | 'diario' = 'comprovantes'): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload?subfolder=${subfolder}`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error('Falha no upload do arquivo');
    }

    return await response.json();
  }

  // --- PERFIL & USUÁRIO ---
  public async updateProfile(data: { nome: string; telefone_whatsapp?: string }): Promise<User> {
    return this.request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async changePassword(senhaAtual: string, novaSenha: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ senhaAtual, novaSenha })
    });
  }

  public async updateTenant(data: {
    nome_fantasia?: string;
    razao_social?: string;
    cnpj?: string;
    telefone?: string;
    email_contato?: string;
  }): Promise<Tenant> {
    return this.request<Tenant>('/auth/tenant', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  public async getTeamMembers(): Promise<TeamMember[]> {
    return this.request<TeamMember[]>('/auth/team');
  }

  public async createTeamMember(data: {
    nome: string;
    email: string;
    senha: string;
    perfil: string;
    telefoneWhatsapp?: string;
  }): Promise<TeamMember> {
    return this.request<TeamMember>('/auth/team', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async updateTeamMemberStatus(id: string, ativo: boolean): Promise<TeamMember> {
    return this.request<TeamMember>(`/auth/team/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo })
    });
  }

  public async getActivityLogs(): Promise<ActivityLog[]> {
    return this.request<ActivityLog[]>('/auth/activity-logs');
  }

  // --- BILLING & ASSINATURAS ---
  public async getBillingOverview(): Promise<BillingOverview> {
    return this.request<BillingOverview>('/billing/subscription');
  }

  public async getInvoices(): Promise<Invoice[]> {
    return this.request<Invoice[]>('/billing/invoices');
  }

  public async getInvoiceStatus(invoiceId: string): Promise<{ invoice: Invoice; subscription: Subscription; isPaid: boolean }> {
    return this.request<{ invoice: Invoice; subscription: Subscription; isPaid: boolean }>(`/billing/invoices/${invoiceId}/status`);
  }

  public async checkoutSubscription(data: CheckoutPayload): Promise<any> {
    return this.request<any>('/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async cancelSubscription(): Promise<any> {
    return this.request<any>('/billing/cancel', {
      method: 'POST'
    });
  }

  public async simulatePayment(data: { invoiceId?: string; plano?: string; ciclo?: string }): Promise<any> {
    return this.request<any>('/billing/simulate-payment', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // --- FLUSH OFFLINE QUEUE ---
  public async flushOfflineQueue(): Promise<number> {
    const queue = offlineQueue.getQueue();
    let flushed = 0;

    for (const item of queue) {
      try {
        if (item.type === 'TRANSACTION') {
          await this.createTransacao(item.payload);
        } else if (item.type === 'DIARIO_PHOTO') {
          await this.createDiarioFoto(item.payload);
        }
        offlineQueue.remove(item.id);
        flushed++;
      } catch (e) {
        console.error('Erro ao sincronizar item offline:', e);
      }
    }
    return flushed;
  }
}

export const api = new ApiClient();
