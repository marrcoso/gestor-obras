import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, Orcamento, OrcamentoItem } from '../config/database.js';

export class OrcamentosController {
  public async list(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId } = req.query;

      let orcamentos = store.orcamentos.filter((o) => o.tenant_id === tenantId);
      if (obraId) {
        orcamentos = orcamentos.filter((o) => o.obra_id === obraId);
      }

      return res.json(orcamentos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const orcamento = store.orcamentos.find((o) => o.id === id && o.tenant_id === tenantId);
      if (!orcamento) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      const itens = store.orcamento_itens.filter(
        (item) => item.tenant_id === tenantId && item.orcamento_id === orcamento.id
      );

      const totalOrcado = itens.reduce((acc, curr) => acc + curr.subtotal_total, 0);

      return res.json({
        ...orcamento,
        valor_total_orcado: totalOrcado,
        total_itens: itens.length,
        itens
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId, titulo, bdiPadraoPercentual } = req.body;

      if (!obraId || !titulo) {
        return res.status(400).json({ error: 'Obra e título do orçamento são obrigatórios' });
      }

      const now = new Date().toISOString();
      const novoOrcamento: Orcamento = {
        id: uuidv4(),
        tenant_id: tenantId,
        obra_id: obraId,
        titulo,
        bdi_padrao_percentual: Number(bdiPadraoPercentual || 20.0),
        valor_total_orcado: 0.0,
        status: 'RASCUNHO',
        created_at: now,
        updated_at: now
      };

      store.orcamentos.push(novoOrcamento);
      db.saveLocalStore();

      return res.status(201).json(novoOrcamento);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async addItem(req: Request, res: Response) {
    try {
      const { id: orcamentoId } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const orcamento = store.orcamentos.find((o) => o.id === orcamentoId && o.tenant_id === tenantId);
      if (!orcamento) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      const { sinapiItemId, codigoItem, descricao, unidade, quantidade, precoUnitarioBase, bdiPercentual } = req.body;

      if (!descricao || !unidade || !quantidade || precoUnitarioBase === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios: descricao, unidade, quantidade, precoUnitarioBase' });
      }

      const bdi = Number(bdiPercentual !== undefined ? bdiPercentual : orcamento.bdi_padrao_percentual || 20);
      const precoBase = Number(precoUnitarioBase);
      const precoVenda = Number((precoBase * (1 + bdi / 100)).toFixed(2));
      const qtd = Number(quantidade);
      const subtotal = Number((precoVenda * qtd).toFixed(2));

      const novoItem: OrcamentoItem = {
        id: uuidv4(),
        tenant_id: tenantId,
        orcamento_id: orcamentoId,
        sinapi_item_id: sinapiItemId,
        codigo_item: codigoItem,
        descricao,
        unidade,
        quantidade: qtd,
        preco_unitario_base: precoBase,
        bdi_percentual: bdi,
        preco_unitario_venda: precoVenda,
        subtotal_total: subtotal,
        created_at: new Date().toISOString()
      };

      store.orcamento_itens.push(novoItem);

      // Recalcula total do orçamento
      const itens = store.orcamento_itens.filter((item) => item.orcamento_id === orcamentoId);
      orcamento.valor_total_orcado = itens.reduce((acc, curr) => acc + curr.subtotal_total, 0);
      orcamento.updated_at = new Date().toISOString();

      db.saveLocalStore();

      return res.status(201).json(novoItem);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async deleteItem(req: Request, res: Response) {
    try {
      const { id: orcamentoId, itemId } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const itemIndex = store.orcamento_itens.findIndex(
        (i) => i.id === itemId && i.orcamento_id === orcamentoId && i.tenant_id === tenantId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item do orçamento não encontrado' });
      }

      store.orcamento_itens.splice(itemIndex, 1);

      // Recalcula total
      const orcamento = store.orcamentos.find((o) => o.id === orcamentoId);
      if (orcamento) {
        const itens = store.orcamento_itens.filter((item) => item.orcamento_id === orcamentoId);
        orcamento.valor_total_orcado = itens.reduce((acc, curr) => acc + curr.subtotal_total, 0);
        orcamento.updated_at = new Date().toISOString();
      }

      db.saveLocalStore();
      return res.json({ message: 'Item removido do orçamento' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const orcamentosController = new OrcamentosController();
