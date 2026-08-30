import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Pool } = pg;

export interface Tenant {
  id: string;
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  telefone?: string;
  email_contato: string;
  plano: 'STARTER' | 'PRO' | 'ENTERPRISE';
  max_obras_ativas: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  nome: string;
  email: string;
  senha_hash: string;
  telefone_whatsapp?: string;
  perfil: 'ADMIN' | 'ENGENHEIRO' | 'MESTRE_OBRA';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: string;
  tenant_id: string;
  nome: string;
  cliente_nome: string;
  cliente_telefone?: string;
  cliente_email?: string;
  endereco_completo?: string;
  cidade?: string;
  estado_uf: string;
  data_inicio: string;
  data_previsao_fim?: string;
  data_conclusao?: string;
  status: 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA';
  orcamento_previsto: number;
  saldo_atual: number;
  created_at: string;
  updated_at: string;
}

export interface TransacaoFinanceira {
  id: string;
  tenant_id: string;
  obra_id: string;
  user_id?: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria:
    | 'MATERIAL_BASICO'
    | 'MATERIAL_ACABAMENTO'
    | 'MAO_DE_OBRA_DIARIA'
    | 'EMPREITEIRO_TERCEIRO'
    | 'EQUIPAMENTO_LOCACAO'
    | 'TRANSPORTE_FRETE'
    | 'ALIMENTACAO_CAMPO'
    | 'PROJETO_TAXAS'
    | 'RECEBIMENTO_CLIENTE'
    | 'OUTROS';
  descricao: string;
  valor: number;
  data_competencia: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  comprovante_url?: string;
  fornecedor_beneficiario?: string;
  observacoes?: string;
  origem_lancamento: 'MOBILE' | 'WEB' | 'IMPORTACAO';
  created_at: string;
  updated_at: string;
}

export interface ContaReceber {
  id: string;
  tenant_id: string;
  obra_id: string;
  numero_parcela: number;
  descricao_medicao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'ATRASADO' | 'CANCELADO';
  historico_cobranca?: string;
  ultimo_contato_cobranca?: string;
  created_at: string;
  updated_at: string;
}

export interface SinapiItem {
  id: string;
  codigo_sinapi: string;
  tipo_item: 'COMPOSICAO' | 'INSUMO';
  descricao: string;
  unidade: string;
  origem_preco: string;
  custo_desonerado?: number;
  custo_nao_desonerado: number;
  estado_uf: string;
  mes_ano_referencia: string;
  created_at: string;
}

export interface Orcamento {
  id: string;
  tenant_id: string;
  obra_id: string;
  titulo: string;
  bdi_padrao_percentual: number;
  valor_total_orcado: number;
  status: 'RASCUNHO' | 'APROVADO' | 'REVISADO';
  created_at: string;
  updated_at: string;
}

export interface OrcamentoItem {
  id: string;
  tenant_id: string;
  orcamento_id: string;
  sinapi_item_id?: string;
  codigo_item?: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  preco_unitario_base: number;
  bdi_percentual: number;
  preco_unitario_venda: number;
  subtotal_total: number;
  created_at: string;
}

export interface DiarioFoto {
  id: string;
  tenant_id: string;
  obra_id: string;
  user_id?: string;
  foto_url: string;
  miniatura_url?: string;
  etapa:
    | 'SERVICOS_PRELIMINARES'
    | 'FUNDACAO_ESTRUTURA'
    | 'ALVENARIA_VEDACAO'
    | 'COBERTURA_TELHADO'
    | 'INSTALACOES_ELETRICA_HIDRAULICA'
    | 'REVESTIMENTO_ACABAMENTO'
    | 'PINTURA_VIDROS'
    | 'ENTREGA_LIMPEZA'
    | 'GERAL';
  descricao?: string;
  data_registro: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_nome: string;
  acao: string;
  detalhes: string;
  ip?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  plano: 'STARTER' | 'PRO' | 'ENTERPRISE';
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  ciclo: 'MENSAL' | 'ANUAL';
  valor: number;
  data_inicio: string;
  data_expiracao: string;
  data_proximo_vencimento: string;
  dias_trial_total: number;
  asaas_customer_id?: string;
  asaas_subscription_id?: string;
  asaas_payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  subscription_id: string;
  valor: number;
  forma_pagamento: 'PIX' | 'CARTAO' | 'BOLETO';
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';
  pix_qrcode_base64?: string;
  pix_copia_cola?: string;
  boleto_url?: string;
  data_vencimento: string;
  data_pagamento?: string;
  asaas_invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS = {
  STARTER: {
    nome: 'Starter / Autônomo',
    preco_mensal: 97.0,
    preco_anual_mensal: 77.0,
    preco_anual_total: 924.0,
    max_obras_ativas: 2,
    max_usuarios: 2,
    recursos: ['SINAPI Nacional Atualizado', 'Canteiro Mobile Offline', 'Comprovantes Rápidos']
  },
  PRO: {
    nome: 'Construtora / Pro',
    preco_mensal: 247.0,
    preco_anual_mensal: 197.0,
    preco_anual_total: 2364.0,
    max_obras_ativas: 6,
    max_usuarios: 5,
    recursos: [
      'Diário Fotográfico Ilimitado',
      'Régua de Inadimplência WhatsApp',
      'Relatórios PDF Executivos',
      'Exportação para Excel'
    ]
  },
  ENTERPRISE: {
    nome: 'Escala / Enterprise',
    preco_mensal: 497.0,
    preco_anual_mensal: 397.0,
    preco_anual_total: 4764.0,
    max_obras_ativas: 999999,
    max_usuarios: 999999,
    recursos: [
      'Obras e Usuários Ilimitados',
      'BDI Multi-nível Customizado',
      'Suporte VIP via WhatsApp',
      'Logo Personalizada nos Relatórios'
    ]
  }
} as const;

export interface DatabaseStore {
  tenants: Tenant[];
  users: User[];
  obras: Obra[];
  transacoes: TransacaoFinanceira[];
  contas_receber: ContaReceber[];
  sinapi_itens: SinapiItem[];
  orcamentos: Orcamento[];
  orcamento_itens: OrcamentoItem[];
  diario_fotos: DiarioFoto[];
  activity_logs: ActivityLog[];
  subscriptions: Subscription[];
  invoices: Invoice[];
}

const defaultData: DatabaseStore = {
  tenants: [],
  users: [],
  obras: [],
  transacoes: [],
  contas_receber: [],
  sinapi_itens: [],
  orcamentos: [],
  orcamento_itens: [],
  diario_fotos: [],
  activity_logs: [],
  subscriptions: [],
  invoices: []
};

const DB_FILE_PATH = path.join(process.cwd(), 'data_store.json');

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPgAvailable = false;
  private store: DatabaseStore = defaultData;

  constructor() {
    this.loadLocalStore();
    this.initPostgres();
  }

  private loadLocalStore() {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        this.store = {
          ...defaultData,
          ...parsed,
          activity_logs: parsed.activity_logs || [],
          subscriptions: parsed.subscriptions || [],
          invoices: parsed.invoices || []
        };
      } else {
        this.saveLocalStore();
      }
    } catch (err) {
      console.warn('⚠️ Usando armazenamento local em memória.');
      this.store = { ...defaultData };
    }
  }

  public saveLocalStore() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao persistir banco de dados local:', err);
    }
  }

  private async initPostgres() {
    if (process.env.DATABASE_URL) {
      try {
        const isLocalPg = process.env.DATABASE_URL.includes('@postgres:') || process.env.DATABASE_URL.includes('@localhost:');
        const useSsl = process.env.DATABASE_SSL === 'true' || (!isLocalPg && process.env.NODE_ENV === 'production');

        this.pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: useSsl ? { rejectUnauthorized: false } : false
        });
        const client = await this.pool.connect();
        this.isPgAvailable = true;
        client.release();
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
      } catch (err) {
        console.warn('ℹ️ PostgreSQL não conectado. Operando com armazenamento local otimizado.');
        this.isPgAvailable = false;
      }
    }
  }

  public getStore(): DatabaseStore {
    return this.store;
  }

  public isUsingPg(): boolean {
    return this.isPgAvailable;
  }

  public getPool(): pg.Pool | null {
    return this.pool;
  }
}

export const db = new DatabaseService();
