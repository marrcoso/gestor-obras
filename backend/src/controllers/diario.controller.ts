import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, DiarioFoto } from '../config/database.js';

export class DiarioController {
  public async list(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const store = db.getStore();
      const { obraId, etapa, dataInicio, dataFim } = req.query;

      let fotos = store.diario_fotos.filter((f) => f.tenant_id === tenantId);

      if (obraId) {
        fotos = fotos.filter((f) => f.obra_id === obraId);
      }
      if (etapa) {
        fotos = fotos.filter((f) => f.etapa === etapa);
      }
      if (dataInicio) {
        fotos = fotos.filter((f) => f.data_registro >= String(dataInicio));
      }
      if (dataFim) {
        fotos = fotos.filter((f) => f.data_registro <= String(dataFim));
      }

      // Ordena por data decrescente
      fotos.sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());

      return res.json(fotos);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const userId = req.user?.userId;
      const store = db.getStore();
      const { obraId, fotoUrl, miniaturaUrl, etapa, descricao, dataRegistro } = req.body;

      if (!obraId || !fotoUrl || !etapa) {
        return res.status(400).json({ error: 'Obra, fotoUrl e etapa são obrigatórios' });
      }

      const obra = store.obras.find((o) => o.id === obraId && o.tenant_id === tenantId);
      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }

      const novaFoto: DiarioFoto = {
        id: uuidv4(),
        tenant_id: tenantId,
        obra_id: obraId,
        user_id: userId,
        foto_url: fotoUrl,
        miniatura_url: miniaturaUrl || fotoUrl,
        etapa,
        descricao,
        data_registro: dataRegistro || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };

      store.diario_fotos.push(novaFoto);
      db.saveLocalStore();

      return res.status(201).json(novaFoto);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async getClientReport(req: Request, res: Response) {
    try {
      const { obraId } = req.params;
      const tenantId = req.tenantId!;
      const store = db.getStore();

      const obra = store.obras.find((o) => o.id === obraId && o.tenant_id === tenantId);
      if (!obra) {
        return res.status(404).json({ error: 'Obra não encontrada' });
      }

      const tenant = store.tenants.find((t) => t.id === tenantId);
      const fotos = store.diario_fotos
        .filter((f) => f.tenant_id === tenantId && f.obra_id === obraId)
        .sort((a, b) => new Date(a.data_registro).getTime() - new Date(b.data_registro).getTime());

      // Agrupa fotos por etapa
      const etapasResumo: Record<string, DiarioFoto[]> = {};
      fotos.forEach((foto) => {
        if (!etapasResumo[foto.etapa]) {
          etapasResumo[foto.etapa] = [];
        }
        etapasResumo[foto.etapa].push(foto);
      });

      return res.json({
        construtora: {
          nome: tenant?.nome_fantasia,
          telefone: tenant?.telefone,
          email: tenant?.email_contato
        },
        obra: {
          id: obra.id,
          nome: obra.nome,
          cliente_nome: obra.cliente_nome,
          data_inicio: obra.data_inicio,
          status: obra.status
        },
        total_fotos: fotos.length,
        gerado_em: new Date().toISOString(),
        etapas: etapasResumo,
        todas_fotos: fotos
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const diarioController = new DiarioController();
