import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Obra, PLAN_LIMITS } from '../config/database.js';

export class ObrasController {
  public async list(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const statusFilter = req.query.status as string;

      let obras = store.obras.filter((o) => o.tenant_id === tenantId);

      if (statusFilter) {
        obras = obras.filter((o) => o.status === statusFilter);
      }

      // Calcula métricas financeiras segregadas para cada obra
      const obrasComMetricas = obras.map((obra) => {
        const transacoesObra = store.transacoes.filter(
          (t) => t.tenant_id === tenantId && t.obra_id === obra.id && t.status === 'PAGO'
        );

        const totalReceitas = transacoesObra
          .filter((t) => t.tipo === 'RECEITA')
          .reduce((acc, curr) => acc + curr.valor, 0);

        const totalDespesas = transacoesObra
          .filter((t) => t.tipo === 'DESPESA')
          .reduce((acc, curr) => acc + curr.valor, 0);

        const saldoReal = totalReceitas - totalDespesas;

        const despesasPendentes = store.transacoes
          .filter((t) => t.tenant_id === tenantId && t.obra_id === obra.id && t.status === 'PENDENTE' && t.tipo === 'DESPESA')
          .reduce((acc, curr) => acc + curr.valor, 0);

        const percentualOrcamentoConsumido =
          obra.orcamento_previsto > 0
            ? Math.min(100, Number(((totalDespesas / obra.orcamento_previsto) * 100).toFixed(1)))
            : 0;

        const totalFotos = store.diario_fotos.filter(
          (f) => f.tenant_id === tenantId && f.obra_id === obra.id
        ).length;

        return {
          ...obra,
          saldo_atual: saldoReal,
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          despesas_pendentes: despesasPendentes,
          percentual_orcamento_consumido: percentualOrcamentoConsumido,
          total_fotos: totalFotos
        };
      });

      return res.json(obrasComMetricas);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const obra = store.obras.find((o) => o.id === id && o.tenant_id === tenantId);
      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }

      const transacoesObra = store.transacoes.filter(
        (t) => t.tenant_id === tenantId && t.obra_id === obra.id
      );

      const totalReceitas = transacoesObra
        .filter((t) => t.tipo === 'RECEITA' && t.status === 'PAGO')
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalDespesas = transacoesObra
        .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
        .reduce((acc, curr) => acc + curr.valor, 0);

      const contasReceber = store.contas_receber.filter(
        (c) => c.tenant_id === tenantId && c.obra_id === obra.id
      );

      const totalInadimplente = contasReceber
        .filter((c) => c.status === 'ATRASADO' || (c.status === 'PENDENTE' && new Date(c.data_vencimento) < new Date()))
        .reduce((acc, curr) => acc + curr.valor, 0);

      return res.json({
        ...obra,
        saldo_atual: totalReceitas - totalDespesas,
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        total_inadimplente: totalInadimplente,
        percentual_orcamento_consumido:
          obra.orcamento_previsto > 0
            ? Number(((totalDespesas / obra.orcamento_previsto) * 100).toFixed(1))
            : 0
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const sub = (store.subscriptions || []).find((s) => s.tenant_id === tenantId);
      const planConfig = PLAN_LIMITS[sub?.plano || 'STARTER'] || PLAN_LIMITS.STARTER;

      const activeObrasCount = store.obras.filter(
        (o) => o.tenant_id === tenantId && o.status === 'EM_ANDAMENTO'
      ).length;

      if (activeObrasCount >= planConfig.max_obras_ativas) {
        return res.status(403).json({
          error: `Limite de obras ativas atingido (${planConfig.max_obras_ativas} obras no Plano ${planConfig.nome}). Faça upgrade de plano para cadastrar novas obras.`,
          code: 'PLAN_LIMIT_REACHED',
          current_count: activeObrasCount,
          max_allowed: planConfig.max_obras_ativas
        });
      }

      const {
        nome,
        clienteNome,
        clienteTelefone,
        clienteEmail,
        enderecoCompleto,
        cidade,
        estadoUf,
        dataInicio,
        dataPrevisaoFim,
        orcamentoPrevisto
      } = req.body;

      if (!nome || !clienteNome || !dataInicio) {
        return res.status(400).json({ error: 'Nome da obra, cliente e data de início são obrigatórios' });
      }

      const now = new Date().toISOString();
      const newObra: Obra = {
        id: uuidv4(),
        tenant_id: tenantId,
        nome,
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone,
        cliente_email: clienteEmail,
        endereco_completo: enderecoCompleto,
        cidade,
        estado_uf: (estadoUf || 'SP').toUpperCase(),
        data_inicio: dataInicio,
        data_previsao_fim: dataPrevisaoFim,
        status: 'EM_ANDAMENTO',
        orcamento_previsto: Number(orcamentoPrevisto || 0),
        saldo_atual: 0,
        created_at: now,
        updated_at: now
      };

      store.obras.push(newObra);
      db.saveLocalStore();

      return res.status(201).json(newObra);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const index = store.obras.findIndex((o) => o.id === id && o.tenant_id === tenantId);
      if (index === -1) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }

      const current = store.obras[index];
      const updated: Obra = {
        ...current,
        ...req.body,
        updated_at: new Date().toISOString()
      };

      store.obras[index] = updated;
      db.saveLocalStore();

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const index = store.obras.findIndex((o) => o.id === id && o.tenant_id === tenantId);
      if (index === -1) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }

      store.obras.splice(index, 1);
      db.saveLocalStore();

      return res.json({ message: 'Obra removida com sucesso' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const obrasController = new ObrasController();
