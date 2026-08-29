# 🚀 Master Plan: Da Validação Técnica ao Retorno Financeiro (SaaS ERP de Obras)

Este documento estabelece o **plano estratégico, financeiro e operacional completo** para transformar o **ERP Leve de Obras** em um **SaaS B2B altamente lucrativo e escalável** no mercado brasileiro de construção civil, operando com **custo fixo inicial de R$ 0 a R$ 30/mês**.

---

## 📊 1. Diagnóstico do Estado Atual & Gaps de Produção

### O que já está desenvolvido e funcional:
- ✅ **Frontend PWA & Web**: Dashboard executivo, Fluxo de Caixa segregado por obra, Módulo de Inadimplência com régua WhatsApp, Orçamentos integrados ao SINAPI da Caixa, Diário de Obras fotográfico e Modo Canteiro Mobile (UX tátil rápida).
- ✅ **Módulo de Assinaturas & Checkout**: Telas de planos, modal de checkout PIX dinâmico com polling de status em tempo real, formulário de cartão com máscaras e banner de status com **Grace Period de 5 dias**.
- ✅ **Backend REST & Multi-Tenant**: API Express em TypeScript com isolamento de dados por `tenant_id`, autenticação JWT, controle de perfis (`ADMIN`, `ENGENHEIRO`, `MESTRE_OBRA`) e middleware de bloqueio tolerante.
- ✅ **Gateway de Pagamento Integrado (Asaas)**: Serviço de integração com Asaas para criação de clientes, cobrança PIX imediata, assinaturas no cartão e webhook handler com idempotência.
- ✅ **Storage S3/R2-Compatible**: Módulo de armazenamento pronto para Cloudflare R2 com fallback local.
- ✅ **Sincronizador SINAPI**: Importador automatizado da tabela oficial da Caixa Econômica Federal.
- ✅ **Database Schema**: Modelagem relacional PostgreSQL completa (`database/schema.sql`) com índices multi-tenant e busca textual.

### Gaps para Lançamento Comercial:
| Área | Status Atual | O que falta para Produção |
| :--- | :--- | :--- |
| **Infraestrutura em Nuvem** | Rodando em localhost | Deploy em stack gratuita (Cloudflare Pages + Render + Neon Postgres + Cloudflare R2) |
| **Chave Oficial Asaas** | Operando em Mock Sandbox | Inserção da API Key de Produção/Sandbox do Asaas no `.env` e cadastro do Webhook público |
| **Landing Page de Conversão** | Sem página pública | Landing page mobile-first focada na dor do pequeno construtor com botão de Teste Grátis de 7 Dias |
| **Onboarding Automatizado** | Criação manual de tenant no seed | Fluxo de auto-cadastro com injeção automática de uma Obra Demo para experimentação imediata |

---

## 🎯 2. Modelo de Negócio, Mercado & Precificação

### 2.1 Perfil de Cliente Ideal (ICP - Ideal Customer Profile)
1. **Pequenas Construtoras e Empreiteiras** (2 a 10 obras simultâneas, faturamento R$ 500k a R$ 5M/ano)
   - *Dor principal*: Mistura de dinheiro entre contas de obras diferentes, furos de orçamento e notas fiscais perdidas no canteiro.
   - *Decisor*: Sócio-proprietário ou Engenheiro Responsável.
2. **Engenheiros e Arquitetos Autônomos de Obra/Reforma** (1 a 3 obras simultâneas)
   - *Dor principal*: Perda de tempo orçando no Excel desatualizado e cobrança constrangedora de medições via WhatsApp.
3. **Mestres de Obras Empreiteiros**
   - *Dor principal*: Falta de comprovantes claros para receber medições do cliente e desorganização de equipe.

---

### 2.2 Estrutura de Planos e Preços (Tabela Comercial)

| Plano | Preço Mensal | Preço Anual (Desc. 20%) | Limite de Obras Ativas | Usuários Inclusos | Destaques |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Plano Autônomo / Starter** | **R$ 97 /mês** | **R$ 77 /mês** (R$ 924/ano) | Até 2 obras simultâneas | 2 usuários (1 Admin + 1 Campo) | SINAPI atualizado, Canteiro Mobile, Comprovantes rápidos |
| **Plano Construtora / Pro** ⭐ *(Mais vendido)* | **R$ 247 /mês** | **R$ 197 /mês** (R$ 2.364/ano) | Até 6 obras simultâneas | 5 usuários (Admin, Engenheiro, Mestres) | Diário Fotográfico ilimitado, Régua de Inadimplência WhatsApp, Relatórios PDF |
| **Plano Escala / Enterprise** | **R$ 497 /mês** | **R$ 397 /mês** (R$ 4.764/ano) | Obras ilimitadas | Usuários ilimitados | BDI multi-nível, Suporte VIP via WhatsApp, Logo personalizada em relatórios |

> [!TIP]
> **Estratégia de Entrada (Trial)**: 7 dias de teste grátis sem cartão de crédito. Se houver atraso na renovação, o sistema concede **5 dias de tolerância (Grace Period)** com aviso visual amigável antes de qualquer restrição.

---

## 💳 3. Masterclass de Pagamentos & Billing SaaS

### 3.1 O que é o Asaas e por que foi escolhido?
O **Asaas** é uma instituição de pagamento brasileira especializada em SaaS e recorrência B2B:
- **Custo Fixo**: **R$ 0,00/mês** (sem taxa de adesão ou mensalidade).
- **Taxa PIX**: **R$ 1,99** por recebimento aprovado (contra 3% a 4% em gateways tradicionais de cartão).
- **Taxa Cartão**: ~2,99% + R$ 0,49 por transação aprovada.
- **Saque PIX**: Transferência gratuita para a conta bancária da sua empresa (PJ ou PF).

### 3.2 O Fluxo Real do Dinheiro & Webhooks
```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Construtora (Cliente)
    participant ERP as Nosso ERP (Frontend + Backend)
    participant Asaas as Gateway Asaas
    participant Banco as Banco do Cliente (PIX / Cartão)
    actor Voce as Sua Conta Bancária PJ

    Cliente->>ERP: Seleciona Plano Pro (R$ 247/mês)
    ERP->>Asaas: Cria Cobrança / Assinatura
    Asaas-->>ERP: Retorna QR Code PIX Dinâmico + Copia e Cola
    ERP-->>Cliente: Exibe QR Code na tela (Inicia Polling a cada 3s)
    Cliente->>Banco: Lê o QR Code e paga no app do banco
    Banco->>Asaas: Liquidação instantânea do PIX
    Asaas->>ERP: Dispara Webhook: POST /api/webhooks/asaas (PAYMENT_RECEIVED)
    ERP->>ERP: Valida token, atualiza fatura para PAGO e ativa assinatura
    ERP-->>Cliente: Frontend detecta confirmação, comemora e libera acesso
    Asaas->>Voce: Saldo disponível para transferência PIX para sua conta
```

---

## 🌐 4. Manual Passo a Passo de Hospedagem Zero-Cost

Para colocar o sistema no ar de forma profissional com **HTTPS/SSL automático, domínio próprio, banco gerenciado e armazenamento de mídia**, utilize a stack abaixo (100% gratuita na fase inicial):

```mermaid
graph TD
    User["📱 Usuário / Cliente<br>(Web / Mobile PWA)"] --> DNS["🌐 Cloudflare DNS & SSL<br>(gestorobras.com.br)"]
    
    DNS --> FE["⚡ Frontend: Cloudflare Pages / Vercel<br>(Build React SPA • R$ 0/mês)"]
    DNS --> BE["🚀 Backend API: Render.com<br>(Node.js Express TS • R$ 0/mês)"]
    
    BE --> DB["🐘 Banco: Neon.tech PostgreSQL<br>(0.5 GB Free Tier • Backups Diários)"]
    BE --> R2["☁️ Mídia: Cloudflare R2 Storage<br>(10 GB Free todo mês • Zero Egress)"]
    BE --> ASAAS["💳 Pagamentos: Asaas Gateway<br>(Webhooks com Idempotência)"]
    ASAAS -.->|Webhook Notificação| BE
```

---

### 🚀 ETAPA 1: Banco de Dados PostgreSQL (Neon.tech - Grátis)

1. Acesse [neon.tech](https://neon.tech) e crie uma conta gratuita.
2. Crie um novo projeto com o nome `gestor-obras-db`.
3. Na dashboard do Neon, selecione a aba **Dashboard** e copie a connection string (`DATABASE_URL`):
   ```text
   postgresql://neondb_owner:SENHA@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Na aba **SQL Editor** do Neon, abra o arquivo local [`database/schema.sql`](file:///home/marcus-vinicius/projects/gestor-obras/database/schema.sql), copie todo o conteúdo e clique em **Run** para criar todas as tabelas, chaves e índices.

---

### ☁️ ETAPA 2: Armazenamento de Fotos na Nuvem (Cloudflare R2 - Grátis)

1. Acesse [cloudflare.com](https://cloudflare.com) e crie uma conta gratuita.
2. No menu lateral esquerdo, vá em **R2 Object Storage**.
3. Clique em **Create bucket** e defina o nome: `erp-obras-media`.
4. No canto direito da tela de R2, clique em **Manage R2 API Tokens** > **Create API Token**:
   - Permissões: **Admin Read & Write**.
   - TTL: Deixe sem expiração.
5. Copie e anote:
   - **Account ID** (disponível na URL ou painel do R2)
   - **Access Key ID**
   - **Secret Access Key**
6. Na aba **Settings** do bucket `erp-obras-media`, vá em **Public Development URL** e clique em **Enable** (ou configure um Custom Domain como `media.gestorobras.com.br`).

---

### 🖥️ ETAPA 3: Deploy do Backend API (Render.com - Grátis)

1. Acesse [render.com](https://render.com) e faça login com seu GitHub.
2. Clique em **New +** > **Web Service**.
3. Selecione o repositório `marrcoso/gestor-obras`.
4. Preencha as configurações do serviço:
   - **Name**: `erp-obras-api`
   - **Region**: `Ohio (US East)` ou `Frankfurt`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Em **Environment Variables**, adicione:
   | Chave | Valor |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `JWT_SECRET` | `uma_chave_longa_e_super_secreta_com_mais_de_32_caracteres` |
   | `CORS_ORIGIN` | `https://app.gestorobras.com.br,https://gestorobras.pages.dev` |
   | `DATABASE_URL` | *(Connection String do Neon obtida na Etapa 1)* |
   | `R2_ACCOUNT_ID` | *(Account ID do Cloudflare)* |
   | `R2_ACCESS_KEY_ID` | *(Access Key ID do R2)* |
   | `R2_SECRET_ACCESS_KEY` | *(Secret Access Key do R2)* |
   | `R2_BUCKET_NAME` | `erp-obras-media` |
   | `R2_PUBLIC_URL` | *(Public URL do bucket R2)* |
   | `ASAAS_API_KEY` | *(Sua chave `$aact_...` gerada no painel do Asaas)* |
   | `ASAAS_ENV` | `production` *(ou `sandbox` se estiver testando)* |
   | `ASAAS_WEBHOOK_SECRET` | `sua_senha_secreta_para_validar_o_webhook` |
6. Clique em **Deploy Web Service**. Em 2 minutos, sua API estará online em `https://erp-obras-api.onrender.com`.

---

### ⚡ ETAPA 4: Deploy do Frontend PWA (Cloudflare Pages - Grátis)

1. No painel da Cloudflare, vá em **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecione o repositório `marrcoso/gestor-obras`.
3. Configure os parâmetros de build:
   - **Project name**: `gestor-obras-app`
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Em **Environment variables**, configure:
   - `VITE_API_BASE_URL`: `https://erp-obras-api.onrender.com/api` (ou `https://api.gestorobras.com.br/api`)
5. Clique em **Save and Deploy**. Seu app estará publicado instantaneamente com CDN global e SSL ativo.

---

### 🔗 ETAPA 5: Cadastrar o Webhook no Painel do Asaas

Agora que sua API está online com endereço público na internet:

1. Acesse sua conta no [Asaas](https://www.asaas.com) (ou [Sandbox](https://sandbox.asaas.com)).
2. No menu lateral, vá em **Minha Conta / Configurações** > **Integrações** > **Webhooks** > **Cobranças**.
3. Preencha os campos:
   - **URL do Webhook**: `https://erp-obras-api.onrender.com/api/webhooks/asaas` (ou seu domínio oficial `https://api.gestorobras.com.br/api/webhooks/asaas`).
   - **Email de Notificação**: Seu email pessoal para avisos de falha.
   - **Token de Autenticação**: O mesmo valor exato definido na variável `ASAAS_WEBHOOK_SECRET`.
   - **Fila de Sincronização**: Selecionar versão `v3`.
4. Marque os eventos de disparo:
   - ✅ `Pagamento recebido` (`PAYMENT_RECEIVED`)
   - ✅ `Pagamento confirmado` (`PAYMENT_CONFIRMED`)
   - ✅ `Pagamento vencido` (`PAYMENT_OVERDUE`)
   - ✅ `Pagamento estornado / reembolsado` (`PAYMENT_REFUNDED`)
   - ✅ `Cobrança removida` (`PAYMENT_DELETED`)
   - ✅ `Assinatura cancelada` (`SUBSCRIPTION_DELETED`)
5. Clique em **Salvar**. Pronto! Todo PIX ou cartão pago disparará a ativação instantânea no seu SaaS.

---

## 💰 5. Custos Reais & Ponto de Equilíbrio (Break-Even)

| Recurso | Provedor | Custo Mensal Inicial (0-100 clientes) |
| :--- | :--- | :--- |
| **Frontend SPA / PWA** | Cloudflare Pages | **R$ 0,00** (Gratuito Ilimitado) |
| **Backend API** | Render.com Web Service | **R$ 0,00** (Free Tier) |
| **PostgreSQL Gerenciado** | Neon.tech Serverless | **R$ 0,00** (500 MB Free Tier) |
| **Armazenamento de Fotos** | Cloudflare R2 | **R$ 0,00** (10 GB Free / R$ 0 Egress) |
| **Gateway de Pagamento** | Asaas | **R$ 0,00 fixo** (R$ 1,99 por PIX recebido) |
| **Domínio Próprio** | Registro.br | ~R$ 40,00 /ano (R$ 3,33/mês) |
| **TOTAL FIXO MENSAL** | | **~R$ 3,33 /mês** |

> [!IMPORTANT]
> **Lucratividade Imediata**: Com **apenas 1 cliente pagante** no Plano Autônomo (R$ 97/mês), a operação já é 100% lucrativa, gerando mais de **R$ 90 de lucro líquido recorrente todo mês**.

---

## 🗓️ 6. Próximos Passos Executivos

```mermaid
flowchart TD
    S1["1. Criar contas gratuitas (Neon.tech, Cloudflare R2 e Render)"] --> S2["2. Realizar deploy do Banco, Backend e Frontend"]
    S2 --> S3["3. Copiar URL pública da API e cadastrar Webhook no Asaas"]
    S3 --> S4["4. Realizar 1 teste real de PIX (R$ 5,00) de ponta a ponta"]
    S4 --> S5["5. Construir Landing Page de Conversão (Fase 2)"]
```

---

> [!NOTE]
> Este documento serve como bússola definitiva de implantação técnica e comercial. Todas as decisões técnicas visam máxima confiabilidade, zero custo fixo inicial e retorno financeiro acelerado.

