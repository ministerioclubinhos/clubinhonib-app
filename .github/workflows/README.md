# GitHub Actions Workflows

## PR Preview Deploy

Este workflow faz deploy automático de previews para cada Pull Request.

### Como funciona

1. Quando um PR é aberto ou atualizado, o workflow:
   - Faz build do projeto com as variáveis de ambiente de staging
   - Faz deploy para a branch `gh-pages` em um subdiretório único por PR
   - Comenta no PR com o link da preview

2. A preview fica disponível em:
   ```
   https://[OWNER].github.io/[REPO]/previews/pr-[NUMBER]/
   ```

### Configuração necessária

Para que o GitHub Pages funcione, você precisa:

1. **Habilitar GitHub Pages no repositório:**
   - Vá em Settings > Pages
   - Source: selecione "Deploy from a branch"
   - Branch: selecione `gh-pages` e pasta `/ (root)`
   - Salve

2. **Permissões do workflow:**
   - O workflow já está configurado com as permissões necessárias
   - Se necessário, vá em Settings > Actions > General > Workflow permissions
   - Selecione "Read and write permissions"

### Variáveis de ambiente

O workflow usa as seguintes variáveis de staging (hardcoded no workflow):
- `VITE_API_URL`: https://staging-api.clubinhonib.com
- `VITE_FEED_MINISTERIO_ID`: afa51053-1296-4c89-9059-a8ad8bd1ec90
- `VITE_GOOGLE_CLIENT_ID`: 135271087774-favt17acohq7ope35eu48v41mi7lbshj.apps.googleusercontent.com
- `VITE_SPECIAL_FAMILY_DAY_ID`: a2f9913a-e123-46b2-b6f4-a4138686042f

### Limpeza

Os previews antigos podem ser limpos manualmente da branch `gh-pages` quando necessário.

