import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimetype: string;
}

export class StorageService {
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private publicBaseUrl: string | null = null;
  private baseUploadDir: string;
  private isCloudActive = false;

  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || process.env.AWS_BUCKET_NAME || 'erp-obras-media';
    this.publicBaseUrl = process.env.R2_PUBLIC_URL || process.env.CDN_URL || null;

    if (accessKeyId && secretAccessKey) {
      try {
        const endpoint = accountId
          ? `https://${accountId}.r2.cloudflarestorage.com`
          : process.env.AWS_S3_ENDPOINT || undefined;

        this.s3Client = new S3Client({
          region: process.env.AWS_REGION || 'auto',
          endpoint,
          credentials: {
            accessKeyId,
            secretAccessKey
          }
        });
        this.isCloudActive = true;
        console.log(`☁️ Cloud Storage inicializado com sucesso (${accountId ? 'Cloudflare R2' : 'AWS S3'} / Bucket: ${this.bucketName})`);
      } catch (err) {
        console.warn('⚠️ Falha ao inicializar Cloud Storage. Operando com armazenamento local:', err);
        this.isCloudActive = false;
      }
    } else {
      console.log('📁 Cloud Storage não configurado. Utilizando armazenamento local em /uploads');
      this.isCloudActive = false;
    }
  }

  public isCloudStorage(): boolean {
    return this.isCloudActive;
  }

  public async saveFile(params: {
    tenantId: string;
    subfolder?: string;
    filename: string;
    buffer: Buffer;
    mimetype: string;
  }): Promise<UploadResult> {
    const { tenantId, filename, buffer, mimetype } = params;
    const subfolder = params.subfolder || 'geral';
    const key = `tenants/${tenantId}/${subfolder}/${filename}`;

    if (this.isCloudActive && this.s3Client) {
      try {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: buffer,
            ContentType: mimetype,
            CacheControl: 'public, max-age=31536000, immutable'
          })
        );

        const url = this.publicBaseUrl
          ? `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`
          : `/uploads/${tenantId}/${subfolder}/${filename}`;

        return {
          url,
          key,
          filename,
          size: buffer.length,
          mimetype
        };
      } catch (cloudErr) {
        console.error('Erro ao enviar para Cloud Storage, fazendo fallback local:', cloudErr);
      }
    }

    // Fallback Local
    const tenantDir = path.join(this.baseUploadDir, tenantId, subfolder);
    if (!fs.existsSync(tenantDir)) {
      fs.mkdirSync(tenantDir, { recursive: true });
    }

    const localFilePath = path.join(tenantDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    const localUrl = `/uploads/${tenantId}/${subfolder}/${filename}`;
    return {
      url: localUrl,
      key,
      filename,
      size: buffer.length,
      mimetype
    };
  }

  public async deleteFile(keyOrUrl: string): Promise<boolean> {
    if (this.isCloudActive && this.s3Client && !keyOrUrl.startsWith('/uploads')) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: keyOrUrl
          })
        );
        return true;
      } catch (err) {
        console.error('Erro ao deletar arquivo da nuvem:', err);
      }
    }

    // Deleta local se for arquivo local
    try {
      const cleanPath = keyOrUrl.replace(/^\/uploads\//, '');
      const localPath = path.join(this.baseUploadDir, cleanPath);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return true;
      }
    } catch (err) {
      console.error('Erro ao deletar arquivo local:', err);
    }
    return false;
  }
}

export const storageService = new StorageService();
