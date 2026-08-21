import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, ContaReceber } from '../config/database.js';

export class ContasReceberController {
  public async list(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId, status } = req.query;

      let contas = store.contas_receber.filter((c) => c.tenant_id === tenantId);

      if (obraId) {
        contas = contas.filter((c) => c.obra_id === obraId);
      }
      if (status) {
        contas = contas.filter((c) => c.status === status);
      }

      const hoje = new Date().toISOString().split('T')[0];

      // Atualiza status dinâmico de vencimento se aplicável
      const contasComDetalhes = contas.map((conta) => {
        const obra = store.obras.find((o) => o.id === conta.obra_id);
        const diasAtraso =
          conta.status !== 'RECEBIDO' && conta.data_vencimento < hoje
            ? Math.floor((new Date(hoje).getTime() - new Date(conta.data_vencimento).getTime()) / (1000 * 3600 * 24))
            : 0;

        return {
          ...conta,
          obra_nome: obra?.nome || 'Obra não identificada',
          cliente_nome: obra?.cliente_nome || 'Cliente não informado',
          cliente_telefone: obra?.cliente_telefone || '',
          dias_atraso: diasAtraso,
          is_vencido: diasAtraso > 0 && conta.status !== 'RECEBIDO'
        };
      });

      return res.json(contasComDetalhes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getInadimplenciaRadar(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const hoje = new Date().toISOString().split('T')[0];

      const contasPendentes = store.contas_receber.filter(
        (c) => c.tenant_id === tenantId && c.status !== 'RECEBIDO' && c.status !== 'CANCELADO'
      );

      let totalVencido = 0;
      let totalAVencer = 0;
      const aging = {
        vencido_1_a_15_dias: 0,
        vencido_16_a_30_dias: 0,
        vencido_mais_30_dias: 0
      };

      const inadimplentesList: any[] = [];

      for (const conta of contasPendentes) {
        const obra = store.obras.find((o) => o.id === conta.obra_id);
        const diasAtraso =
          conta.data_vencimento < hoje
            ? Math.floor((new Date(hoje).getTime() - new Date(conta.data_vencimento).getTime()) / (1000 * 3600 * 24))
            : 0;

        if (diasAtraso > 0) {
          totalVencido += conta.valor;
          if (diasAtraso <= 15) {
            aging.vencido_1_a_15_dias += conta.valor;
          } else if (diasAtraso <= 30) {
            aging.vencido_16_a_30_dias += conta.valor;
          } else {
            aging.vencido_mais_30_dias += conta.valor;
          }

          inadimplentesList.push({
            id: conta.id,
            obra_id: conta.obra_id,
            obra_nome: obra?.nome || 'Obra',
            cliente_nome: obra?.cliente_nome || 'Cliente',
            cliente_telefone: obra?.cliente_telefone || '',
            numero_parcela: conta.numero_parcela,
            descricao_medicao: conta.descricao_medicao,
            valor: conta.valor,
            data_vencimento: conta.data_vencimento,
            dias_atraso: diasAtraso,
            ultimo_contato_cobranca: conta.ultimo_contato_cobranca
          });
        } else {
          totalAVencer += conta.valor;
        }
      }

      // Ordena inadimplentes pelos mais críticos (maior atraso)
      inadimplentesList.sort((a, b) => b.dias_atraso - a.dias_atraso);

      return res.json({
        total_vencido: totalVencido,
        total_a_vencer: totalAVencer,
        aging,
        total_clientes_inadimplentes: inadimplentesList.length,
        inadimplentes: inadimplentesList
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getWhatsappCobrancaMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const conta = store.contas_receber.find((c) => c.id === id && c.tenant_id === tenantId);
      if (!conta) {
        return res.status(404).json({ error: 'Título a receber não encontrado' });
      }

      const obra = store.obras.find((o) => o.id === conta.obra_id);
      const tenant = store.tenants.find((t) => t.id === tenantId);

      const nomeCliente = obra?.cliente_nome || 'Cliente';
      const nomeObra = obra?.nome || 'sua obra';
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(conta.valor);
      const dataFormatada = conta.data_vencimento.split('-').reverse().join('/');
      const nomeEmpresa = tenant?.nome_fantasia || 'Nossa Construtora';

      const mensagem = `Olá, *${nomeCliente}*! Tudo bem?\n\nPassando para lembrar da parcela *${conta.numero_parcela}ª - ${conta.descricao_medicao}* referente à obra *${nomeObra}* no valor de *${valorFormatado}*, com vencimento em *${dataFormatada}*.\n\nQualquer dúvida ou caso já tenha efetuado o pagamento, por favor nos avise.\n\nAtenciosamente,\n*${nomeEmpresa}*`;

      const telefoneLimpo = (obra?.cliente_telefone || '').replace(/\D/g, '');
      const whatsappUrl = telefoneLimpo
        ? `https://wa.me/55${telefoneLimpo}?text=${encodeURIComponent(mensagem)}`
        : null;

      return res.json({
        mensagem,
        telefone: obra?.cliente_telefone,
        whatsapp_url: whatsappUrl
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId, numeroParcela, descricaoMedicao, valor, dataVencimento } = req.body;

      if (!obraId || !descricaoMedicao || !valor || !dataVencimento) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const now = new Date().toISOString();
      const novaConta: ContaReceber = {
        id: uuidv4(),
        tenant_id: tenantId,
        obra_id: obraId,
        numero_parcela: Number(numeroParcela || 1),
        descricao_medicao: descricaoMedicao,
        valor: Number(valor),
        data_vencimento: dataVencimento,
        status: 'PENDENTE',
        created_at: now,
        updated_at: now
      };

      store.contas_receber.push(novaConta);
      db.saveLocalStore();

      return res.status(201).json(novaConta);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async marcarRecebido(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dataRecebimento } = req.body;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const conta = store.contas_receber.find((c) => c.id === id && c.tenant_id === tenantId);
      if (!conta) {
        return res.status(404).json({ error: 'Título não encontrado' });
      }

      const hoje = new Date().toISOString().split('T')[0];
      conta.status = 'RECEBIDO';
      conta.data_recebimento = dataRecebimento || hoje;
      conta.updated_at = new Date().toISOString();

      // Opcional: cria automaticamente a transação de RECEITA no caixa da obra correspondente
      const transacaoExistente = store.transacoes.find(
        (t) => t.tenant_id === tenantId && t.obra_id === conta.obra_id && t.descricao.includes(conta.descricao_medicao)
      );

      if (!transacaoExistente) {
        store.transacoes.push({
          id: uuidv4(),
          tenant_id: tenantId,
          obra_id: conta.obra_id,
          tipo: 'RECEITA',
          categoria: 'RECEBIMENTO_CLIENTE',
          descricao: `Recebimento Parcela ${conta.numero_parcela} - ${conta.descricao_medicao}`,
          valor: conta.valor,
          data_competencia: hoje,
          data_vencimento: conta.data_vencimento,
          data_pagamento: conta.data_recebimento,
          status: 'PAGO',
          origem_lancamento: 'WEB',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }

      db.saveLocalStore();
      return res.json({ message: 'Título recebido e creditado no caixa da obra!', conta });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async registrarContatoCobranca(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { anotacao } = req.body;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const conta = store.contas_receber.find((c) => c.id === id && c.tenant_id === tenantId);
      if (!conta) {
        return res.status(404).json({ error: 'Título não encontrado' });
      }

      const now = new Date().toISOString();
      conta.ultimo_contato_cobranca = now;
      if (anotacao) {
        conta.historico_cobranca = `${conta.historico_cobranca || ''}\n[${now.split('T')[0]}] ${anotacao}`.trim();
      }
      conta.updated_at = now;

      db.saveLocalStore();
      return res.json(conta);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const contasReceberController = new ContasReceberController();
