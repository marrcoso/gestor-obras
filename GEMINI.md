# Diretrizes de Git & Commits

Sempre que o usuário solicitar para commitar alterações:

1. **Inspeção Prévia**:
   - Execute `git status` e verifique o estado da árvore de trabalho antes de preparar os commits.
   - Garanta que arquivos ignorados (ex: `dist/`, `node_modules/`, arquivos de log) não sejam incluídos.

2. **Separação em Commits Atômicos por Contexto**:
   - Divida as alterações em grupos lógicos e independentes:
     - `design-system` / `typography`: Tokens CSS, fontes, variáveis globais e estilização base.
     - `components`: Navbar, Sidebar, MobileBottomNav, Modais e elementos reutilizáveis.
     - `pages`: Telas completas (Dashboard, FluxoCaixa, Inadimplência, SINAPI, Diário, Login, etc.).
     - `backend`: Rotas, controllers, regras de negócio e banco de dados.
     - `chore` / `config`: Configurações de ambiente, scripts e `.gitignore`.

3. **Padrão de Mensagem (Conventional Commits em Português)**:
   - Estrutura: `tipo(escopo): mensagem concisa`
   - Tipos comuns: `feat`, `refactor`, `fix`, `chore`, `style`, `docs`.
   - Corpo do commit: Não incluir descrição de commits, apenas os títulos.

4. **Publicação Automática (Push na Branch Ativa)**:
   - Após finalizar a criação dos commits atômicos locais, identifique a branch atual (`git branch --show-current`) e realize o envio via `git push origin <branch_atual>`.
