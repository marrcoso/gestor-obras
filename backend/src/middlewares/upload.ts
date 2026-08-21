import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../services/storage.service.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantId = req.tenantId || 'global';
    const subfolder = (req.query.subfolder as 'comprovantes' | 'diario' | 'geral') || 'geral';
    const dir = storageService.getTenantUploadDir(tenantId, subfolder);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo inválido. Suportados: JPG, PNG, WEBP, PDF.'));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});
