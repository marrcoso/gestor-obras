-- ==============================================================================
-- ERP LEVE DE OBRAS - SCHEMA POSTGRESQL MULTI-TENANT
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TENANTS (EMPRESAS / CONSTRUTORAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(200),
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email_contato VARCHAR(100) NOT NULL,
    plano VARCHAR(30) DEFAULT 'STARTER' CHECK (plano IN ('STARTER', 'PRO', 'ENTERPRISE')),
    max_obras_ativas INT DEFAULT 3,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. USUÁRIOS & CONTROLE DE ACESSO
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone_whatsapp VARCHAR(20),
    perfil VARCHAR(20) NOT NULL DEFAULT 'MESTRE_OBRA' CHECK (perfil IN ('ADMIN', 'ENGENHEIRO', 'MESTRE_OBRA')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_tenant_user_email UNIQUE (tenant_id, email)
);

-- ------------------------------------------------------------------------------
-- 3. OBRAS (CENTROS DE CUSTO ISOLADOS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS obras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cliente_nome VARCHAR(150) NOT NULL,
    cliente_telefone VARCHAR(20),
    cliente_email VARCHAR(100),
    endereco_completo TEXT,
    cidade VARCHAR(100),
    estado_uf VARCHAR(2) NOT NULL DEFAULT 'SP',
    data_inicio DATE NOT NULL,
    data_previsao_fim DATE,
    data_conclusao DATE,
    status VARCHAR(20) DEFAULT 'EM_ANDAMENTO' CHECK (status IN ('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA')),
    orcamento_previsto NUMERIC(15, 2) DEFAULT 0.00,
    saldo_atual NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. TRANSAÇÕES FINANCEIRAS (FLUXO DE CAIXA SEGREGADO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN (
        'MATERIAL_BASICO',
        'MATERIAL_ACABAMENTO',
        'MAO_DE_OBRA_DIARIA',
        'EMPREITEIRO_TERCEIRO',
        'EQUIPAMENTO_LOCACAO',
        'TRANSPORTE_FRETE',
        'ALIMENTACAO_CAMPO',
        'PROJETO_TAXAS',
        'RECEBIMENTO_CLIENTE',
        'OUTROS'
    )),
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL CHECK (valor > 0),
    data_competencia DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(15) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'CANCELADO')),
    comprovante_url TEXT,
    fornecedor_beneficiario VARCHAR(150),
    observacoes TEXT,
    origem_lancamento VARCHAR(15) DEFAULT 'MOBILE' CHECK (origem_lancamento IN ('MOBILE', 'WEB', 'IMPORTACAO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. CONTROLE DE INADIMPLÊNCIA & CONTAS A RECEBER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    numero_parcela INT NOT NULL DEFAULT 1,
    descricao_medicao VARCHAR(150) NOT NULL,
    valor NUMERIC(15, 2) NOT NULL CHECK (valor > 0),
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status VARCHAR(15) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'RECEBIDO', 'ATRASADO', 'CANCELADO')),
    historico_cobranca TEXT,
    ultimo_contato_cobranca TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. TABELA SINAPI (BASE PÚBLICA CAIXA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sinapi_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_sinapi VARCHAR(30) NOT NULL,
    tipo_item VARCHAR(20) NOT NULL CHECK (tipo_item IN ('COMPOSICAO', 'INSUMO')),
    descricao TEXT NOT NULL,
    unidade VARCHAR(15) NOT NULL,
    origem_preco VARCHAR(20) DEFAULT 'MEDIANA',
    custo_desonerado NUMERIC(12, 2),
    custo_nao_desonerado NUMERIC(12, 2) NOT NULL,
    estado_uf VARCHAR(2) NOT NULL,
    mes_ano_referencia VARCHAR(7) NOT NULL, -- formato: 'YYYY-MM'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_sinapi_cod_uf_mes UNIQUE (codigo_sinapi, estado_uf, mes_ano_referencia)
);

-- ------------------------------------------------------------------------------
-- 7. ORÇAMENTOS E ITENS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL DEFAULT 'Orçamento Inicial',
    bdi_padrao_percentual NUMERIC(5, 2) DEFAULT 20.00,
    valor_total_orcado NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(15) DEFAULT 'RASCUNHO' CHECK (status IN ('RASCUNHO', 'APROVADO', 'REVISADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orcamento_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
    sinapi_item_id UUID REFERENCES sinapi_itens(id) ON DELETE SET NULL,
    codigo_item VARCHAR(30),
    descricao TEXT NOT NULL,
    unidade VARCHAR(15) NOT NULL,
    quantidade NUMERIC(12, 3) NOT NULL CHECK (quantidade > 0),
    preco_unitario_base NUMERIC(12, 2) NOT NULL,
    bdi_percentual NUMERIC(5, 2) DEFAULT 20.00,
    preco_unitario_venda NUMERIC(12, 2) NOT NULL,
    subtotal_total NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- ------------------------------------------------------------------------------
-- 8. DIÁRIO DE OBRA VISUAL (FOTOS & EVOLUÇÃO)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diario_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    obra_id UUID NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    foto_url TEXT NOT NULL,
    miniatura_url TEXT,
    etapa VARCHAR(30) NOT NULL CHECK (etapa IN (
        'SERVICOS_PRELIMINARES',
        'FUNDACAO_ESTRUTURA',
        'ALVENARIA_VEDACAO',
        'COBERTURA_TELHADO',
        'INSTALACOES_ELETRICA_HIDRAULICA',
        'REVESTIMENTO_ACABAMENTO',
        'PINTURA_VIDROS',
        'ENTREGA_LIMPEZA',
        'GERAL'
    )),
    descricao TEXT,
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. ASSINATURAS & BILLING SAAS (ASAAS / GATEWAY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plano VARCHAR(20) NOT NULL DEFAULT 'STARTER' CHECK (plano IN ('STARTER', 'PRO', 'ENTERPRISE')),
    status VARCHAR(20) NOT NULL DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED')),
    ciclo VARCHAR(10) NOT NULL DEFAULT 'MENSAL' CHECK (ciclo IN ('MENSAL', 'ANUAL')),
    valor NUMERIC(10, 2) NOT NULL DEFAULT 97.00,
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_proximo_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
    dias_trial_total INT NOT NULL DEFAULT 7,
    asaas_customer_id VARCHAR(50),
    asaas_subscription_id VARCHAR(50),
    asaas_payment_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    forma_pagamento VARCHAR(15) NOT NULL DEFAULT 'PIX' CHECK (forma_pagamento IN ('PIX', 'CARTAO', 'BOLETO')),
    status VARCHAR(15) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')),
    pix_qrcode_base64 TEXT,
    pix_copia_cola TEXT,
    boleto_url TEXT,
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    asaas_invoice_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- ÍNDICES ESTRATÉGICOS (PERFORMANCE MULTI-TENANT E BUSCA)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_obras_tenant_status ON obras(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_transacoes_tenant_obra ON transacoes_financeiras(tenant_id, obra_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_vencimento ON transacoes_financeiras(tenant_id, data_vencimento, status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(tenant_id, data_vencimento, status);
CREATE INDEX IF NOT EXISTS idx_diario_fotos_obra_etapa ON diario_fotos(tenant_id, obra_id, etapa, data_registro DESC);
CREATE INDEX IF NOT EXISTS idx_sinapi_busca ON sinapi_itens(estado_uf, mes_ano_referencia, codigo_sinapi);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant_status ON invoices(tenant_id, status, data_vencimento);

-- Índice GIN para busca textual rápida na base SINAPI
CREATE INDEX IF NOT EXISTS idx_sinapi_descricao_gin ON sinapi_itens USING gin(to_tsvector('portuguese', descricao));
