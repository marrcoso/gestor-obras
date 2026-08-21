import cron from 'node-cron';
import { sinapiImporterService } from '../services/sinapi-importer.service.js';

export function setupSinapiCronJob() {
  // Executa todo dia 1 do mês às 03:00 da madrugada
  cron.schedule('0 3 1 * *', async () => {
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const mesAno = `${ano}-${mes}`;

    console.log(`[CRON SINAPI] 🔄 Iniciando rotina mensal de atualização do SINAPI (${mesAno})...`);

    try {
      const ufs = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'GO', 'PE', 'CE', 'DF', 'SC'];
      for (const uf of ufs) {
        sinapiImporterService.seedDefaultSinapi(uf, mesAno);
      }
      console.log(`[CRON SINAPI] ✅ Atualização da base SINAPI concluída com sucesso para o mês ${mesAno}!`);
    } catch (err) {
      console.error('[CRON SINAPI] ❌ Erro ao atualizar tabela SINAPI:', err);
    }
  });

  console.log('⏰ Job automatizado do SINAPI agendado (Execução mensal: dia 1 às 03:00).');
}
