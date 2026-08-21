import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.routes.js';
import obrasRoutes from './routes/obras.routes.js';
import transacoesRoutes from './routes/transacoes.routes.js';
import contasReceberRoutes from './routes/contas-receber.routes.js';
import sinapiRoutes from './routes/sinapi.routes.js';
import orcamentosRoutes from './routes/orcamentos.routes.js';
import diarioRoutes from './routes/diario.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos de uploads (comprovantes e fotos de obras)
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'ERP Leve de Obras API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/obras', obrasRoutes);
app.use('/api/transacoes', transacoesRoutes);
app.use('/api/contas-receber', contasReceberRoutes);
app.use('/api/sinapi', sinapiRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/diario', diarioRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

export default app;
