import { sinapiImporterService } from '../services/sinapi-importer.service.js';

async function main() {
  const args = process.argv.slice(2);
  const uf = (args[0] || 'SP').toUpperCase();
  const mesAno = args[1] || '2026-08';

  console.log(`[SINAPI CLI] Sincronizando catálogo SINAPI para o estado ${uf} (Referência: ${mesAno})...`);
  const total = sinapiImporterService.seedDefaultSinapi(uf, mesAno);
  console.log(`[SINAPI CLI] Concluído! ${total} itens sincronizados e disponíveis.`);
}

main().catch(console.error);
