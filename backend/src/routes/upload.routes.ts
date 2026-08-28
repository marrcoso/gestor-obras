import { Router } from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadMiddleware } from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';
import { storageService } from '../services/storage.service.js';

const router = Router();

router.use(authMiddleware);

router.post('/', uploadMiddleware.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const tenantId = req.tenantId || 'global';
    const subfolder = (req.query.subfolder as string) || 'geral';
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const filename = `${uuidv4()}${ext}`;

    const uploaded = await storageService.saveFile({
      tenantId,
      subfolder,
      filename,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype
    });

    return res.status(201).json({
      url: uploaded.url,
      filename: uploaded.filename,
      original_name: req.file.originalname,
      size: uploaded.size,
      mimetype: uploaded.mimetype,
      is_cloud: storageService.isCloudStorage()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao processar upload' });
  }
});

router.post('/multiple', uploadMiddleware.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const tenantId = req.tenantId || 'global';
    const subfolder = (req.query.subfolder as string) || 'geral';

    const uploadedPromises = files.map((file) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      const filename = `${uuidv4()}${ext}`;
      return storageService.saveFile({
        tenantId,
        subfolder,
        filename,
        buffer: file.buffer,
        mimetype: file.mimetype
      });
    });

    const results = await Promise.all(uploadedPromises);

    return res.status(201).json({
      files: results,
      is_cloud: storageService.isCloudStorage()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao processar uploads' });
  }
});

export default router;
