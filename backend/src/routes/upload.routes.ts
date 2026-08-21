import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';
import { storageService } from '../services/storage.service.js';

const router = Router();

router.use(authMiddleware);

router.post('/', uploadMiddleware.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const tenantId = req.tenantId || 'global';
    const subfolder = (req.query.subfolder as string) || 'geral';
    const url = storageService.getPublicUrl(tenantId, subfolder, req.file.filename);

    return res.status(201).json({
      url,
      filename: req.file.filename,
      original_name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/multiple', uploadMiddleware.array('files', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const tenantId = req.tenantId || 'global';
    const subfolder = (req.query.subfolder as string) || 'geral';

    const uploaded = files.map((file) => ({
      url: storageService.getPublicUrl(tenantId, subfolder, file.filename),
      filename: file.filename,
      original_name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    return res.status(201).json({ files: uploaded });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
