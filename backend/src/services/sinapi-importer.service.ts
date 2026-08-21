import * as xlsx from 'xlsx';
import { db, SinapiItem } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export class SinapiImporterService {
  /**
   * Processa uma planilha XLSX/CSV baixada da Caixa Econômica Federal
   */
  public async parseSinapiFile(
    fileBuffer: Buffer,
    estadoUf: string,
    mesAno: string
  ): Promise<{ inserted: number; updated: number }> {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const store = db.getStore();
    let inserted = 0;
    let updated = 0;

    // Localiza o cabeçalho das linhas
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rows.length, 15); i++) {
      const rowStr = (rows[i] || []).join(' ').toLowerCase();
      if (rowStr.includes('código') || rowStr.includes('codigo') || rowStr.includes('descrição')) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 0;
    }

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length < 3) continue;

      const rawCode = String(row[0] || row[1] || '').trim();
      const rawDesc = String(row[1] || row[2] || '').trim();
      const rawUn = String(row[2] || row[3] || 'UN').trim();
      const rawPrice = parseFloat(String(row[row.length - 1] || '0').replace('.', '').replace(',', '.'));

      if (!rawCode || !rawDesc || isNaN(rawPrice) || rawPrice <= 0) continue;

      const existingIndex = store.sinapi_itens.findIndex(
        (item) =>
          item.codigo_sinapi === rawCode &&
          item.estado_uf === estadoUf.toUpperCase() &&
          item.mes_ano_referencia === mesAno
      );

      const itemData: SinapiItem = {
        id: existingIndex >= 0 ? store.sinapi_itens[existingIndex].id : uuidv4(),
        codigo_sinapi: rawCode,
        tipo_item: rawDesc.toUpperCase().includes('COMPOSIÇÃO') ? 'COMPOSICAO' : 'INSUMO',
        descricao: rawDesc,
        unidade: rawUn,
        origem_preco: 'MEDIANA',
        custo_nao_desonerado: rawPrice,
        custo_desonerado: Number((rawPrice * 0.92).toFixed(2)),
        estado_uf: estadoUf.toUpperCase(),
        mes_ano_referencia: mesAno,
        created_at: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        store.sinapi_itens[existingIndex] = itemData;
        updated++;
      } else {
        store.sinapi_itens.push(itemData);
        inserted++;
      }
    }

    db.saveLocalStore();
    return { inserted, updated };
  }

  /**
   * Seed automático com os principais serviços da construção civil brasileira
   */
  public seedDefaultSinapi(uf: string = 'SP', mesAno: string = '2026-08'): number {
    const store = db.getStore();

    const sampleCompositions = [
      {
        codigo_sinapi: '92412',
        descricao: 'ALVENARIA DE VEDAÇÃO DE BLOCOS CERÂMICOS FURADOS NA HORIZONTAL DE 9X19X19CM (ESPESSURA 9CM) DE PAREDES COM ÁREA LÍQUIDA MAIOR OU IGUAL A 6M² COM ARGAMASSA DE ASSENTAMENTO',
        unidade: 'M2',
        custo_nao_desonerado: 62.45
      },
      {
        codigo_sinapi: '92413',
        descricao: 'ALVENARIA DE VEDAÇÃO DE BLOCOS CERÂMICOS FURADOS NA VERTICAL DE 14X19X29CM (ESPESSURA 14CM) COM ARGAMASSA DE ASSENTAMENTO',
        unidade: 'M2',
        custo_nao_desonerado: 89.30
      },
      {
        codigo_sinapi: '92762',
        descricao: 'ARMAÇÃO DE PILAR OU VIGA DE UMA ESTRUTURA CONVENCIONAL DE CONCRETO ARMADO EM EDIFICAÇÃO COM AÇO CA-50 DE 10.0 MM - FORNECIMENTO, CORTE, DOBRA E COLOCAÇÃO',
        unidade: 'KG',
        custo_nao_desonerado: 14.80
      },
      {
        codigo_sinapi: '92763',
        descricao: 'ARMAÇÃO DE PILAR OU VIGA DE CONCRETO ARMADO COM AÇO CA-50 DE 12.5 MM - CORTE, DOBRA E COLOCAÇÃO',
        unidade: 'KG',
        custo_nao_desonerado: 13.95
      },
      {
        codigo_sinapi: '94964',
        descricao: 'CONCRETO FCK = 25MPA, TRAÇO 1:2,3:2,7 (EM MASSA SECA DE CIMENTO/ AREIA MÉDIA/ BRITA 1) - PREPARO MECÂNICO COM BETONEIRA 400 L',
        unidade: 'M3',
        custo_nao_desonerado: 485.50
      },
      {
        codigo_sinapi: '94965',
        descricao: 'CONCRETO USINADO BOMBEÁVEL FCK = 30MPA, LANÇAMENTO E ADENSAMENTO EM ESTRUTURA',
        unidade: 'M3',
        custo_nao_desonerado: 560.00
      },
      {
        codigo_sinapi: '87529',
        descricao: 'EMBOÇO OU MASSA ÚNICA EM ARGAMASSA TRAÇO 1:2:8, PREPARO MECÂNICO, APLICADA MANUALMENTE EM PANOS DE FACHADA DE EDIFICAÇÃO',
        unidade: 'M2',
        custo_nao_desonerado: 44.15
      },
      {
        codigo_sinapi: '87878',
        descricao: 'REBOCO OU MASSA FINA DE PAREDE INTERNA COM ARGAMASSA PRÉ-FABRICADA, ESPESSURA DE 5MM',
        unidade: 'M2',
        custo_nao_desonerado: 28.90
      },
      {
        codigo_sinapi: '88489',
        descricao: 'APLICAÇÃO MANUAL DE PINTURA COM TINTA LÁTEX ACRÍLICA EM PAREDES, DUAS DEMÃOS',
        unidade: 'M2',
        custo_nao_desonerado: 19.75
      },
      {
        codigo_sinapi: '88485',
        descricao: 'APLICAÇÃO MANUAL DE MASSA CORRIDA PVA EM PAREDES INTERNAS, DUAS DEMÃOS',
        unidade: 'M2',
        custo_nao_desonerado: 22.10
      },
      {
        codigo_sinapi: '87251',
        descricao: 'REVESTIMENTO CERÂMICO PARA PISO COM PLACAS TIPO ESMALTADA EXTRA DE DIMENSÕES 45X45 CM APLICADA EM AMBIENTES DE ÁREA MAIOR QUE 5 M2',
        unidade: 'M2',
        custo_nao_desonerado: 73.60
      },
      {
        codigo_sinapi: '87255',
        descricao: 'REVESTIMENTO COM PORCELANATO POLIDO RETIFICADO DE 60X60 CM COM ARGAMASSA COLANTE AC-III',
        unidade: 'M2',
        custo_nao_desonerado: 118.50
      },
      {
        codigo_sinapi: '91834',
        descricao: 'TUBULAÇÃO DE PVC RÍGIDO SOLDÁVEL DN 25 MM (3/4") PARA ÁGUA FRIA, INSTALADA EM PRUMADA OU RAMAL',
        unidade: 'M',
        custo_nao_desonerado: 18.20
      },
      {
        codigo_sinapi: '91836',
        descricao: 'TUBULAÇÃO DE PVC RÍGIDO SOLDÁVEL DN 50 MM (1 1/2") PARA ESGOTO PREDIAL',
        unidade: 'M',
        custo_nao_desonerado: 34.60
      },
      {
        codigo_sinapi: '91837',
        descricao: 'TUBULAÇÃO DE PVC RÍGIDO ESGOTO DN 100 MM (4") COM JUNTA ELÁSTICA',
        unidade: 'M',
        custo_nao_desonerado: 52.80
      },
      {
        codigo_sinapi: '91926',
        descricao: 'CABO DE COBRE FLEXÍVEL ISOLADO, 2,5 MM², ANTI-CHAMA 450/750 V, PARA CIRCUITOS TERMINAIS',
        unidade: 'M',
        custo_nao_desonerado: 4.85
      },
      {
        codigo_sinapi: '91928',
        descricao: 'CABO DE COBRE FLEXÍVEL ISOLADO, 6,0 MM², ANTI-CHAMA 450/750 V',
        unidade: 'M',
        custo_nao_desonerado: 9.90
      },
      {
        codigo_sinapi: '91953',
        descricao: 'INTERRUPTOR SIMPLES (1 MÓDULO) COM 1 TOMADA 2P+T 10A, COM PLACA E SUPORTE 4X2',
        unidade: 'UN',
        custo_nao_desonerado: 31.40
      },
      {
        codigo_sinapi: '94200',
        descricao: 'ESTRUTURA DE MADEIRA PARA TELHADO COM TELHA CERÂMICA OU DE CONCRETO, COM TELHAS INCLUSAS',
        unidade: 'M2',
        custo_nao_desonerado: 142.00
      },
      {
        codigo_sinapi: '93358',
        descricao: 'ESCAVAÇÃO MANUAL DE VALAS PARA FUNDAÇÃO / VIGAS BALDRAMES COM PROFUNDIDADE ATÉ 1,50 M',
        unidade: 'M3',
        custo_nao_desonerado: 78.30
      },
      {
        codigo_sinapi: '96535',
        descricao: 'FABRICAÇÃO, MONTAGEM E DESMONTAGEM DE FÔRMA PARA VIGAS E PILARES EM CHAPA DE MADEIRA COMPENSADA RESINADA E = 12MM',
        unidade: 'M2',
        custo_nao_desonerado: 84.70
      },
      {
        codigo_sinapi: '88309',
        descricao: 'PEDREIRO COM ENCARGOS COMPLEMENTARES (HORA)',
        unidade: 'H',
        custo_nao_desonerado: 28.50
      },
      {
        codigo_sinapi: '88316',
        descricao: 'SERVENTE COM ENCARGOS COMPLEMENTARES (HORA)',
        unidade: 'H',
        custo_nao_desonerado: 19.80
      },
      {
        codigo_sinapi: '88264',
        descricao: 'ELETRICISTA COM ENCARGOS COMPLEMENTARES (HORA)',
        unidade: 'H',
        custo_nao_desonerado: 30.10
      },
      {
        codigo_sinapi: '88267',
        descricao: 'ENCANADOR OU BOMBEIRO HIDRÁULICO COM ENCARGOS COMPLEMENTARES (HORA)',
        unidade: 'H',
        custo_nao_desonerado: 29.40
      }
    ];

    let count = 0;
    for (const item of sampleCompositions) {
      const existing = store.sinapi_itens.find(
        (si) => si.codigo_sinapi === item.codigo_sinapi && si.estado_uf === uf && si.mes_ano_referencia === mesAno
      );

      if (!existing) {
        store.sinapi_itens.push({
          id: uuidv4(),
          codigo_sinapi: item.codigo_sinapi,
          tipo_item: item.unidade === 'H' ? 'INSUMO' : 'COMPOSICAO',
          descricao: item.descricao,
          unidade: item.unidade,
          origem_preco: 'MEDIANA',
          custo_nao_desonerado: item.custo_nao_desonerado,
          custo_desonerado: Number((item.custo_nao_desonerado * 0.92).toFixed(2)),
          estado_uf: uf,
          mes_ano_referencia: mesAno,
          created_at: new Date().toISOString()
        });
        count++;
      }
    }

    db.saveLocalStore();
    return count;
  }
}

export const sinapiImporterService = new SinapiImporterService();
