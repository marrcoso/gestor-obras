import app from './app.js';
import dotenv from 'dotenv';
import { setupSinapiCronJob } from './jobs/sinapi-cron.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 ERP Leve de Obras - Backend REST API rodando na porta ${PORT}`);
  console.log(`📡 URL Base: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('====================================================');

  // Inicializa job do SINAPI
  setupSinapiCronJob();
});
