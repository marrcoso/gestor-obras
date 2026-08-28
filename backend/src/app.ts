import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import billingRoutes from './routes/billing.routes.js';
import webhookRoutes from './routes/webhook.routes.js';

// Middlewares
import { enforceActiveSubscription } from './middlewares/subscription.js';

const app = express();

// Security Headers com Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Desativado para facilitar assets e embeds do PWA
  })
);

// CORS Config
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions: cors.CorsOptions = {
  origin: corsOrigin ? (corsOrigin.includes(',') ? corsOrigin.split(',') : corsOrigin) : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

// Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 200, // 200 requisições por minuto
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Por favor, tente novamente em alguns instantes.' }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 60, // 60 tentativas por IP a cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login ou registro. Tente novamente mais tarde.' }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// API Public / Webhooks
app.use('/api/webhooks', webhookRoutes);

// Auth Routes (com rate limiter de segurança)
app.use('/api/auth', authLimiter, authRoutes);

// Billing Routes
app.use('/api/billing', billingRoutes);

// API Routes Protegidas com Verificação de Assinatura
app.use('/api/obras', enforceActiveSubscription, obrasRoutes);
app.use('/api/transacoes', enforceActiveSubscription, transacoesRoutes);
app.use('/api/contas-receber', enforceActiveSubscription, contasReceberRoutes);
app.use('/api/sinapi', sinapiRoutes);
app.use('/api/orcamentos', enforceActiveSubscription, orcamentosRoutes);
app.use('/api/diario', enforceActiveSubscription, diarioRoutes);
app.use('/api/upload', enforceActiveSubscription, uploadRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

export default app;
