import fs from 'fs';
import path from 'path';

export class StorageService {
  private baseUploadDir: string;

  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  public getTenantUploadDir(tenantId: string, subfolder: 'comprovantes' | 'diario' | 'geral' = 'geral'): string {
    const tenantDir = path.join(this.baseUploadDir, tenantId, subfolder);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }
    return tenantDir;
  }

  public getPublicUrl(tenantId: string, subfolder: string, filename: string): string {
    // Retorna URL acessível via backend express static
    return `/uploads/${tenantId}/${subfolder}/${filename}`;
  }
}

export const storageService = new StorageService();
