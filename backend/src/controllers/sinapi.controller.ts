import { Request, Response } from 'express';
import { db } from '../config/database.js';
import { sinapiImporterService } from '../services/sinapi-importer.service.js';

export class SinapiController {
  public async search(req: Request, res: Response) {
    try {
      const { q, uf = 'SP', tipo, limit = 50, page = 1 } = req.query;
      const store = db.getStore();

      let itens = store.sinapi_itens.filter((item) => item.estado_uf === String(uf).toUpperCase());

      // Auto seed se vazio para a UF
      if (itens.length === 0 && String(uf).toUpperCase() === 'SP') {
        sinapiImporterService.seedDefaultSinapi('SP', '2026-08');
        itens = store.sinapi_itens.filter((item) => item.estado_uf === 'SP');
      }

      if (tipo) {
        itens = itens.filter((item) => item.tipo_item === tipo);
      }

      if (q) {
        const termo = String(q).toLowerCase().trim();
        itens = itens.filter(
          (item) =>
            item.codigo_sinapi.includes(termo) ||
            item.descricao.toLowerCase().includes(termo) ||
            item.unidade.toLowerCase().includes(termo)
        );
      }

      const total = itens.length;
      const numLimit = Number(limit);
      const numPage = Number(page);
      const start = (numPage - 1) * numLimit;
      const paginated = itens.slice(start, start + numLimit);

      return res.json({
        total,
        page: numPage,
        limit: numLimit,
        total_pages: Math.ceil(total / numLimit),
        data: paginated
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async seed(req: Request, res: Response) {
    try {
      const { uf = 'SP', mesAno = '2026-08' } = req.body;
      const count = sinapiImporterService.seedDefaultSinapi(String(uf), String(mesAno));
      return res.json({ message: `Carga inicial do SINAPI realizada com sucesso. ${count} novos itens.` });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public async uploadSinapiFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { uf = 'SP', mesAno = '2026-08' } = req.body;
      const result = await sinapiImporterService.parseSinapiFile(req.file.buffer, String(uf), String(mesAno));

      return res.json({
        message: 'Arquivo SINAPI processado com sucesso!',
        inserted: result.inserted,
        updated: result.updated
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export const sinapiController = new SinapiController();
