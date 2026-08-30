#!/usr/bin/env bash
# ==============================================================================
# Script de Backup Automático do Banco de Dados PostgreSQL (Docker Compose)
# Projeto: Gestor de Obras
# ==============================================================================

set -euo pipefail

# Diretório base do projeto (onde está o docker-compose.yml)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Diretório de destino dos backups
BACKUP_DIR="${PROJECT_DIR}/backups"
mkdir -p "$BACKUP_DIR"

# Configurações do Banco
DB_USER="${POSTGRES_USER:-erp_user}"
DB_NAME="${POSTGRES_DB:-erp_obras}"
RETENTION_DAYS=60 # Dias para manter os backups antigos

TIMESTAMP="$(date +%Y-%m-%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup do banco de dados: ${DB_NAME}..."

# Executa pg_dump dentro do container sem alocar TTY (-T) e compacta com gzip
cd "$PROJECT_DIR"
docker compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Verifica se o arquivo foi criado e possui tamanho > 0
if [ -s "$BACKUP_FILE" ]; then
    FILE_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup concluído com sucesso: ${BACKUP_FILE} (${FILE_SIZE})"
else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: O arquivo de backup foi criado vazio ou falhou!" >&2
    exit 1
fi

# Expurgo automático de backups mais antigos que RETENTION_DAYS dias
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Limpando backups anteriores a ${RETENTION_DAYS} dias..."
find "$BACKUP_DIR" -type f -name "backup_${DB_NAME}_*.sql.gz" -mtime +"$RETENTION_DAYS" -exec rm -f {} +

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotina de backup finalizada."
