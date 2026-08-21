import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, TransacaoFinanceira } from '../config/database.js';

export class TransacoesController {
  public async list(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId, tipo, categoria, status, dataInicio, dataFim } = req.query;

      let transacoes = store.transacoes.filter((t) => t.tenant_id === tenantId);

      if (obraId) {
        transacoes = transacoes.filter((t) => t.obra_id === obraId);
      }
      if (tipo) {
        transacoes = transacoes.filter((t) => t.tipo === tipo);
      }
      if (categoria) {
        transacoes = transacoes.filter((t) => t.categoria === categoria);
      }
      if (status) {
        transacoes = transacoes.filter((t) => t.status === status);
      }
      if (dataInicio) {
        transacoes = transacoes.filter((t) => t.data_vencimento >= String(dataInicio));
      }
      if (dataFim) {
        transacoes = transacoes.filter((t) => t.data_vencimento <= String(dataFim));
      }

      // Ordenar por data de vencimento / criação decrescente
      transacoes.sort((a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime());

      return res.json(transacoes);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getFluxoResumo(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId } = req.query;

      let transacoes = store.transacoes.filter((t) => t.tenant_id === tenantId);
      if (obraId) {
        transacoes = transacoes.filter((t) => t.obra_id === obraId);
      }

      const totalReceitas = transacoes
        .filter((t) => t.tipo === 'RECEITA' && t.status === 'PAGO')
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalDespesas = transacoes
        .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalDespesasPendentes = transacoes
        .filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalReceitasPendentes = transacoes
        .filter((t) => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
        .reduce((acc, curr) => acc + curr.valor, 0);

      // Despesas agrupadas por categoria
      const despesasPorCategoria: Record<string, number> = {};
      transacoes
        .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
        .forEach((t) => {
          despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
        });

      return res.json({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        saldo_liquido: totalReceitas - totalDespesas,
        total_despesas_pendentes: totalDespesasPendentes,
        total_receitas_pendentes: totalReceitasPendentes,
        despesas_por_categoria: despesasPorCategoria
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user?.userId;
      const store = db.getStore();

      const {
        obraId,
        tipo,
        categoria,
        descricao,
        valor,
        dataCompetencia,
        dataVencimento,
        dataPagamento,
        status,
        comprovanteUrl,
        fornecedorBeneficiario,
        observacoes,
        origemLancamento
      } = req.body;

      if (!obraId || !tipo || !categoria || !descricao || !valor) {
        return res.status(400).json({ error: 'Campos obrigatórios: obraId, tipo, categoria, descricao, valor' });
      }

      const obra = store.obras.find((o) => o.id === obraId && o.tenant_id === tenantId);
      if (!obra) {
        return res.status(404).json({ error: 'Obra vinculada não encontrada' });
      }

      const now = new Date().toISOString();
      const dataHoje = now.split('T')[0];

      const newTransacao: TransacaoFinanceira = {
        id: uuidv4(),
        tenant_id: tenantId,
        obra_id: obraId,
        user_id: userId,
        tipo,
        categoria,
        descricao,
        valor: Number(valor),
        data_competencia: dataCompetencia || dataHoje,
        data_vencimento: dataVencimento || dataHoje,
        data_pagamento: status === 'PAGO' ? dataPagamento || dataHoje : undefined,
        status: status || 'PAGO',
        comprovante_url: comprovanteUrl,
        fornecedor_beneficiario: fornecedorBeneficiario,
        observacoes,
        origem_lancamento: origemLancamento || (req.user?.perfil === 'MESTRE_OBRA' ? 'MOBILE' : 'WEB'),
        created_at: now,
        updated_at: now
      };

      store.transacoes.push(newTransacao);
      db.saveLocalStore();

      return res.status(201).json(newTransacao);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, dataPagamento } = req.body;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const transacao = store.transacoes.find((t) => t.id === id && t.tenant_id === tenantId);
      if (!transacao) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      transacao.status = status;
      if (status === 'PAGO') {
        transacao.data_pagamento = dataPagamento || new Date().toISOString().split('T')[0];
      } else if (status === 'PENDENTE') {
        transacao.data_pagamento = undefined;
      }
      transacao.updated_at = new Date().toISOString();

      db.saveLocalStore();
      return res.json(transacao);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const index = store.transacoes.findIndex((t) => t.id === id && t.tenant_id === tenantId);
      if (index === -1) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      store.transacoes.splice(index, 1);
      db.saveLocalStore();

      return res.json({ message: 'Transação excluída com sucesso' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const transacoesController = new TransacoesController();
