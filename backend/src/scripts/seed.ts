import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, Tenant, User, Obra, TransacaoFinanceira, ContaReceber, DiarioFoto, Subscription, Invoice } from '../config/database.js';
import { sinapiImporterService } from '../services/sinapi-importer.service.js';

async function runSeed() {
  console.log('🌱 Iniciando carga de dados de demonstração (Seed)...');

  const store = db.getStore();
  const now = new Date().toISOString();
  const hojeStr = now.split('T')[0];

  // 1. Cria Tenant de Demonstração
  const tenantId = uuidv4();
  const tenant: Tenant = {
    id: tenantId,
    nome_fantasia: 'Alfa Engenharia & Construções',
    razao_social: 'Alfa Engenharia e Construções Civis Ltda',
    cnpj: '45.123.789/0001-90',
    telefone: '(11) 98765-4321',
    email_contato: 'contato@alfaengenharia.com.br',
    plano: 'PRO',
    max_obras_ativas: 10,
    ativo: true,
    created_at: now,
    updated_at: now
  };

  // 2. Cria Usuários (Admin / Engenheiro e Mestre de Obra)
  const senhaHash = await bcrypt.hash('senha123', 10);

  const adminUser: User = {
    id: uuidv4(),
    tenant_id: tenantId,
    nome: 'Carlos Silva (Engenheiro & Dono)',
    email: 'admin@alfaengenharia.com',
    senha_hash: senhaHash,
    telefone_whatsapp: '11987654321',
    perfil: 'ADMIN',
    ativo: true,
    created_at: now,
    updated_at: now
  };

  const mestreUser: User = {
    id: uuidv4(),
    tenant_id: tenantId,
    nome: 'Sebastião Oliveira (Mestre de Obras)',
    email: 'mestre@alfaengenharia.com',
    senha_hash: senhaHash,
    telefone_whatsapp: '11976543210',
    perfil: 'MESTRE_OBRA',
    ativo: true,
    created_at: now,
    updated_at: now
  };

  // 3. Cria Obras Piloto (Centros de custo isolados)
  const obra1Id = uuidv4();
  const obra1: Obra = {
    id: obra1Id,
    tenant_id: tenantId,
    nome: 'Residencial Jardim das Flores - Casa 04',
    cliente_nome: 'Roberto Guimarães',
    cliente_telefone: '11991234567',
    cliente_email: 'roberto.guimaraes@gmail.com',
    endereco_completo: 'Rua das Camélias, 120 - Granja Viana',
    cidade: 'Cotia',
    estado_uf: 'SP',
    data_inicio: '2026-06-01',
    data_previsao_fim: '2026-12-15',
    status: 'EM_ANDAMENTO',
    orcamento_previsto: 420000.00,
    saldo_atual: 45200.00,
    created_at: now,
    updated_at: now
  };

  const obra2Id = uuidv4();
  const obra2: Obra = {
    id: obra2Id,
    tenant_id: tenantId,
    nome: 'Reforma Comercial Edifício Paulista',
    cliente_nome: 'Dra. Camila Vasconcelos (Clínica)',
    cliente_telefone: '11988776655',
    cliente_email: 'camila@clinicaestetica.com.br',
    endereco_completo: 'Av. Paulista, 1578 - Conjunto 82',
    cidade: 'São Paulo',
    estado_uf: 'SP',
    data_inicio: '2026-07-15',
    data_previsao_fim: '2026-10-30',
    status: 'EM_ANDAMENTO',
    orcamento_previsto: 185000.00,
    saldo_atual: 12800.00,
    created_at: now,
    updated_at: now
  };

  // 4. Lançamentos Financeiros (Fluxo de Caixa Segregado)
  const transacoes: TransacaoFinanceira[] = [
    // Obra 1 - Entradas e Saídas
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: adminUser.id,
      tipo: 'RECEITA',
      categoria: 'RECEBIMENTO_CLIENTE',
      descricao: 'Entrada / Sinal de Contrato - Obra Jardim das Flores',
      valor: 85000.00,
      data_competencia: '2026-06-05',
      data_vencimento: '2026-06-05',
      data_pagamento: '2026-06-05',
      status: 'PAGO',
      origem_lancamento: 'WEB',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: adminUser.id,
      tipo: 'RECEITA',
      categoria: 'RECEBIMENTO_CLIENTE',
      descricao: 'Medição 1 - Conclusão Fundação e Alvenaria Bruta',
      valor: 60000.00,
      data_competencia: '2026-07-10',
      data_vencimento: '2026-07-10',
      data_pagamento: '2026-07-10',
      status: 'PAGO',
      origem_lancamento: 'WEB',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: mestreUser.id,
      tipo: 'DESPESA',
      categoria: 'MATERIAL_BASICO',
      descricao: '120 Sacos Cimento CP-II + 14m³ Areia Média Lavada',
      valor: 8940.00,
      data_competencia: '2026-06-12',
      data_vencimento: '2026-06-12',
      data_pagamento: '2026-06-12',
      status: 'PAGO',
      fornecedor_beneficiario: 'Depósito de Materiais União',
      origem_lancamento: 'MOBILE',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: mestreUser.id,
      tipo: 'DESPESA',
      categoria: 'MAO_DE_OBRA_DIARIA',
      descricao: 'Pagamento Quinzenal Equipe de Pedreiros e Serventes (4 profissionais)',
      valor: 14200.00,
      data_competencia: '2026-06-20',
      data_vencimento: '2026-06-20',
      data_pagamento: '2026-06-20',
      status: 'PAGO',
      fornecedor_beneficiario: 'Equipe de Campo',
      origem_lancamento: 'MOBILE',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: adminUser.id,
      tipo: 'DESPESA',
      categoria: 'EQUIPAMENTO_LOCACAO',
      descricao: 'Locação Mensal Betoneira 400L + Andaimes Fachadeiros',
      valor: 3400.00,
      data_competencia: '2026-07-01',
      data_vencimento: '2026-07-01',
      data_pagamento: '2026-07-01',
      status: 'PAGO',
      fornecedor_beneficiario: 'Andaimes & Cia Locações',
      origem_lancamento: 'WEB',
      created_at: now,
      updated_at: now
    },
    // Obra 2 - Entradas e Saídas
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra2Id,
      user_id: adminUser.id,
      tipo: 'RECEITA',
      categoria: 'RECEBIMENTO_CLIENTE',
      descricao: 'Sinal de Contrato - Reforma Clínica Comercial',
      valor: 45000.00,
      data_competencia: '2026-07-15',
      data_vencimento: '2026-07-15',
      data_pagamento: '2026-07-15',
      status: 'PAGO',
      origem_lancamento: 'WEB',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra2Id,
      user_id: mestreUser.id,
      tipo: 'DESPESA',
      categoria: 'MATERIAL_ACABAMENTO',
      descricao: 'Gesso Acartonado Drywall 12.5mm + Perfis F530 e Guias',
      valor: 16800.00,
      data_competencia: '2026-07-22',
      data_vencimento: '2026-07-22',
      data_pagamento: '2026-07-22',
      status: 'PAGO',
      fornecedor_beneficiario: 'Distribuidora Drywall SP',
      origem_lancamento: 'MOBILE',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra2Id,
      user_id: mestreUser.id,
      tipo: 'DESPESA',
      categoria: 'TRANSPORTE_FRETE',
      descricao: 'Caçambas de Entulho com Descarte Certificado (4 viagens)',
      valor: 2400.00,
      data_competencia: '2026-07-28',
      data_vencimento: '2026-07-28',
      data_pagamento: '2026-07-28',
      status: 'PAGO',
      fornecedor_beneficiario: 'Caçambas LimpaObra',
      origem_lancamento: 'MOBILE',
      created_at: now,
      updated_at: now
    }
  ];

  // 5. Contas a Receber (Demonstração de Inadimplência e WhatsApp)
  const contasReceber: ContaReceber[] = [
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      numero_parcela: 2,
      descricao_medicao: 'Medição 2 - Cobertura e Alvenaria Concluída',
      valor: 55000.00,
      data_vencimento: '2026-08-10', // Vencida há alguns dias -> Alerta de Inadimplência
      status: 'ATRASADO',
      historico_cobranca: '[2026-08-12] Cliente avisou que faria a liberação até sexta-feira',
      ultimo_contato_cobranca: '2026-08-12T14:30:00Z',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      numero_parcela: 3,
      descricao_medicao: 'Medição 3 - Revestimentos e Instalações Elétricas/Hidráulicas',
      valor: 65000.00,
      data_vencimento: '2026-09-10',
      status: 'PENDENTE',
      created_at: now,
      updated_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra2Id,
      numero_parcela: 2,
      descricao_medicao: 'Medição 2 - Drywall e Infraestrutura de Ar Condicionado',
      valor: 40000.00,
      data_vencimento: '2026-08-25',
      status: 'PENDENTE',
      created_at: now,
      updated_at: now
    }
  ];

  // 6. Diário de Obras Fotográfico
  const diarioFotos: DiarioFoto[] = [
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: mestreUser.id,
      foto_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
      etapa: 'FUNDACAO_ESTRUTURA',
      descricao: 'Concretagem das sapatas e vigas baldrame finalizada com sucesso. Teste de corpos de prova realizado.',
      data_registro: '2026-06-18',
      created_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra1Id,
      user_id: mestreUser.id,
      foto_url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
      etapa: 'ALVENARIA_VEDACAO',
      descricao: 'Levantamento das paredes do térreo e amarração com pilares estruturais.',
      data_registro: '2026-07-08',
      created_at: now
    },
    {
      id: uuidv4(),
      tenant_id: tenantId,
      obra_id: obra2Id,
      user_id: mestreUser.id,
      foto_url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      etapa: 'INSTALACOES_ELETRICA_HIDRAULICA',
      descricao: 'Passagem dos conduítes elétricos e montagem da estrutura de drywall acústico para os consultórios.',
      data_registro: '2026-07-26',
      created_at: now
    }
  ];

  // Salva no banco
  const subId = uuidv4();
  const subExpiration = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const subscription: Subscription = {
    id: subId,
    tenant_id: tenantId,
    plano: 'PRO',
    status: 'ACTIVE',
    ciclo: 'ANUAL',
    valor: 2364.00,
    data_inicio: now,
    data_expiracao: subExpiration,
    data_proximo_vencimento: subExpiration,
    dias_trial_total: 7,
    created_at: now,
    updated_at: now
  };

  const invoice: Invoice = {
    id: uuidv4(),
    tenant_id: tenantId,
    subscription_id: subId,
    valor: 2364.00,
    forma_pagamento: 'PIX',
    status: 'PAGO',
    data_vencimento: hojeStr,
    data_pagamento: now,
    created_at: now,
    updated_at: now
  };

  store.tenants = [tenant];
  store.users = [adminUser, mestreUser];
  store.obras = [obra1, obra2];
  store.transacoes = transacoes;
  store.contas_receber = contasReceber;
  store.diario_fotos = diarioFotos;
  store.subscriptions = [subscription];
  store.invoices = [invoice];

  // 7. Carrega SINAPI
  const totalSinapi = sinapiImporterService.seedDefaultSinapi('SP', '2026-08');

  db.saveLocalStore();

  console.log('✅ Seed executado com sucesso!');
  console.log(`- 1 Construtora: ${tenant.nome_fantasia}`);
  console.log(`- 2 Usuários: admin@alfaengenharia.com (senha123) e mestre@alfaengenharia.com (senha123)`);
  console.log(`- 1 Assinatura SaaS Ativa: Plano ${subscription.plano} (${subscription.ciclo})`);
  console.log(`- 2 Obras com Centros de Custo Ativos`);
  console.log(`- ${transacoes.length} Lançamentos Financeiros (Fluxo de Caixa Segregado)`);
  console.log(`- ${contasReceber.length} Títulos a Receber (com 1 caso crítico de Inadimplência para teste de cobrança)`);
  console.log(`- ${diarioFotos.length} Registros no Diário de Obra com fotos de evolução`);
  console.log(`- ${totalSinapi} Itens da Tabela SINAPI prontos para orçamentação`);
}

runSeed().catch(console.error);
