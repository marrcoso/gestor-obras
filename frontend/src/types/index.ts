export interface Tenant {
  id: string;
  nome_fantasia: string;
  razao_social?: string;
  cnpj?: string;
  telefone?: string;
  email_contato: string;
  plano: 'STARTER' | 'PRO' | 'ENTERPRISE';
  max_obras_ativas: number;
}

export interface User {
  id: string;
  tenant_id: string;
  nome: string;
  email: string;
  telefone_whatsapp?: string;
  perfil: 'ADMIN' | 'ENGENHEIRO' | 'MESTRE_OBRA';
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
  total_receitas?: number;
  total_despesas?: number;
  despesas_pendentes?: number;
  percentual_orcamento_consumido?: number;
  total_fotos?: number;
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
}

export interface FluxoResumo {
  total_receitas: number;
  total_despesas: number;
  saldo_liquido: number;
  total_despesas_pendentes: number;
  total_receitas_pendentes: number;
  despesas_por_categoria: Record<string, number>;
}

export interface ContaReceber {
  id: string;
  tenant_id: string;
  obra_id: string;
  obra_nome?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  numero_parcela: number;
  descricao_medicao: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: 'PENDENTE' | 'RECEBIDO' | 'ATRASADO' | 'CANCELADO';
  dias_atraso?: number;
  is_vencido?: boolean;
  historico_cobranca?: string;
  ultimo_contato_cobranca?: string;
}

export interface InadimplenciaRadarData {
  total_vencido: number;
  total_a_vencer: number;
  aging: {
    vencido_1_a_15_dias: number;
    vencido_16_a_30_dias: number;
    vencido_mais_30_dias: number;
  };
  total_clientes_inadimplentes: number;
  inadimplentes: ContaReceber[];
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
}

export interface Orcamento {
  id: string;
  tenant_id: string;
  obra_id: string;
  titulo: string;
  bdi_padrao_percentual: number;
  valor_total_orcado: number;
  status: 'RASCUNHO' | 'APROVADO' | 'REVISADO';
  itens?: OrcamentoItem[];
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

export interface Notificacao {
  id: string;
  tipo:
    | 'INADIMPLENCIA'
    | 'ALERTA_FINANCEIRO'
    | 'ORCAMENTO_LIMITE'
    | 'PRAZO_OBRA'
    | 'DIARIO_OBRA'
    | 'OFFLINE_SYNC'
    | 'SISTEMA';
  prioridade?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  titulo: string;
  mensagem: string;
  link_acao?: string;
  lida?: boolean;
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

export interface TeamMember {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'ENGENHEIRO' | 'MESTRE_OBRA';
  telefone_whatsapp?: string;
  ativo: boolean;
  created_at?: string;
}

