# Plano de Implementação Frontend — Streaming de Mídia e Download Seguro

**Status:** plano de implementação; nenhuma alteração de código está autorizada por este documento.

**Última revisão:** 2026-09-08

**Escopo do repositório:** `clubinhonib-app`

**Dependência principal:** [`clubinhonib-api/doc/implementaion-plan/media-streaming-implementation-plan.md`](../../../clubinhonib-api/doc/implementaion-plan/media-streaming-implementation-plan.md)

---

## 1. Como este plano deve ser usado

Este documento separa rigorosamente:

1. **requisitos confirmados** pelo solicitante;
2. **fatos verificados** no repositório frontend (`clubinhonib-app`);
3. **decisões ainda não fornecidas** (**DECISÃO PENDENTE**);
4. **trabalho de implementação condicionado** a essas decisões.

Nenhum item marcado como **DECISÃO PENDENTE** pode ser transformado em código, configuração ou interface por escolha implícita do implementador. Isso é estritamente necessário para cumprir o requisito de **zero suposições**.

---

## 2. Requisitos confirmados pelo solicitante

> [!IMPORTANT]
> **REGRA DE OURO DA APLICAÇÃO FRONTEND:**
> A aplicação frontend **NUNCA** recebe nem manipula a URL direta do AWS S3 (`*.s3.amazonaws.com`). Toda e qualquer exibição de mídia enviada por upload (vídeos, áudios, imagens e documentos/PDFs) é **SEMPRE realizada via STREAMING através dos endpoints da API NestJS** (`GET /media-items/:id/stream`).

### 2.1 Diretrizes Confirmadas no Frontend
- **Ocultação 100% Garantida do S3:** Nenhuma string contendo `s3.amazonaws.com` pode estar presente no código-fonte, nos atributos HTML (`src`, `href`), nas requisições HTTP da aba Network ou no fluxo de salvamento de arquivos.
- **Visualização Exclusiva por Streaming da API:** Elementos de mídia (`<video>`, `<audio>`, `<img>`, `<iframe>`) e modais de visualização de documentos reproduzem conteúdos consumindo diretamente as rotas proxy de streaming da API (`GET /media-items/:id/stream`).
- **Download Seguro via API:** Funcionalidades de download utilizam a rota dedicada do backend (`GET /media-items/:id/download`) ou tratamento seguro via Blob local, sem abrir janelas/abas `_blank` apontando para links do S3.
- **Autenticação Transparente para Players HTML5:** Uso do mecanismo de tickets temporários (`POST /media-items/:id/ticket`) para permitir que tags nativas do navegador reproduzam streamings autenticados sem expor senhas ou tokens de longa duração na URL.
- **Padrão Zero Suposições:** O plano de implementação segue o padrão rigoroso de trava de decisões dos documentos da pasta `doc/implementaion-plan/`.

---

## 3. Diagnóstico confirmado do estado atual no frontend

O inventário abaixo foi levantado mediante inspeção direta no código existente do repositório `clubinhonib-app`:

### 3.1 Utilitário de Resolutividade de Preview (`src/utils/getMediaPreviewUrl.ts`)
- O método `getMediaPreviewUrl(media: MediaItem)` verifica o `uploadType` e o `isLocalFile`.
- **Fato verificado:** Quando `uploadType === MediaUploadType.UPLOAD` ou `isLocalFile === true`, o utilitário retorna diretamente a propriedade `media.url`. Como a API atualmente devolve a URL do S3 nessa propriedade, o utilitário repassa o link do S3 para todos os componentes consumidores.

### 3.2 Modal de Preview de Documentos (`src/utils/MediaDocumentPreviewModal.tsx`)
- O componente gerencia a abertura e o download de documentos e PDFs.
- **Fato verificado:** No efeito `useEffect` e no render, o componente faz:
  - `window.open(previewUrl || downloadUrl, '_blank', 'noopener,noreferrer');`
  - `fetch(downloadUrl)` onde `downloadUrl` é a URL direta do S3.
  - Isso vaza a URL do S3 no histórico de navegação, na nova aba aberta e nas requisições da aba Network.

### 3.3 Botões de Download de Materiais (`DownloadButton.tsx`)
- Componentes analisados:
  - `src/pages/PageView/WeekMaterialViewPage/DownloadButton.tsx`
  - `src/pages/PageView/IdeasMaterialViewpage/DownloadButton.tsx`
- **Fato verificado:** Ambos os componentes recebem a propriedade `url` (com o link do S3) e executam:
  - `window.open(url, '_blank', 'noopener,noreferrer');`
  - `const response = await fetch(url, { signal: controller.signal });`
  - Criam uma tag `<a href={blobUrl} download={filename}>` dinamicamente para forçar o download no cliente.

### 3.4 Componentes de Exibição de Mídia (`src/components/common/media/MediaPreview.tsx`)
- **Fato verificado:** O componente renderiza elementos nativos passando `item.url` diretamente:
  - `<video controls><source src={item.url} /></video>`
  - `<img src={item.url} alt={item.title} />`
  - `<audio controls><source src={item.url} /></audio>`
- Como esses elementos realizam requisições `GET` diretas pelo navegador sem incluir o cabeçalho `Authorization: Bearer <token>`, eles falharão caso a API feche o acesso anônimo às mídias.

---

## 4. Trava de decisões — zero suposições

Antes de iniciar qualquer codificação no frontend, **todas as decisões abaixo devem ter sua opção aprovada pelo responsável pelo projeto**.

| ID | Decisão exigida | Por que não pode ser inferida | Bloqueia |
| --- | --- | --- | --- |
| **D-001** | Como o frontend lidará com a obtenção do ticket temporário de streaming para injetar nos elementos nativos (`<video src>`, `<audio src>`, `<img src>`)?<br><br>**Opções:**<br>**(A)** Usar o hook `useMediaStream(mediaId)` que realiza uma chamada `POST /media-items/:id/ticket` via Axios e retorna a URL da API com o parâmetro `?ticket=...`.<br>**(B)** Depender de cookies `HttpOnly` configurados pela API no momento do login.<br>**(C)** Fazer fetch do arquivo via Axios com `responseType: 'blob'`, criando uma `blob:` URL para o elemento visual. | A Opção (A) exige requisição prévia de ticket antes da renderização; a Opção (C) impede a transferência por partes (*streaming partial content*) em vídeos de grande porte. | Hooks e Componentes |
| **D-002** | Qual deve ser o comportamento do `DownloadButton` ao ser clicado pelo usuário?<br><br>**Opções:**<br>**(A)** Disparar o download em segundo plano via Axios (`GET /media-items/:id/download` com `responseType: 'blob'`), exibindo um indicador de progresso (*CircularProgress*) e forçando o salvamento via Blob URL local.<br>**(B)** Redirecionar diretamente o navegador para a rota de download da API (ex.: `window.location.href = `${API_URL}/media-items/${id}/download?ticket=${ticket}``). | A Opção (A) permite barra de progresso customizada, mas consome memória RAM no cliente para arquivos grandes. A Opção (B) delega o download ao gerenciador nativo do navegador. | Componente DownloadButton |
| **D-003** | Como os documentos/PDFs devem ser exibidos dentro do `MediaDocumentPreviewModal` em dispositivos móveis (smartphones/tablets)?<br><br>**Opções:**<br>**(A)** Fazer fetch do PDF via Axios (`blob`), criar uma Blob URL e renderizar dentro de um `<iframe>` responsivo no modal.<br>**(B)** No mobile, não abrir o iFrame e acionar diretamente o download do arquivo. | Navegadores móveis (Safari no iOS e Chrome no Android) possuem comportamentos divergentes ao renderizar PDFs dentro de iFrames. | Modal de Documentos |
| **D-004** | Como o frontend deve diferenciar o tratamento de mídias do tipo `UPLOAD` (armazenadas no S3 via API) de mídias do tipo `LINK` (YouTube, Google Drive, Dropbox, OneDrive)?<br><br>**Opções:**<br>**(A)** Mídias `UPLOAD` utilizam o hook `useMediaStream` para obter a URL de stream da API; mídias `LINK` continuam usando a lógica existente de embed/thumbnail da plataforma de origem.<br>**(B)** Todas as mídias passam por uma rota de proxy unificada no backend. | Links de terceiros (YouTube, Google Drive) não aceitam a rota de streaming da API e precisam de embeds específicos da plataforma original. | Utilitários de Mídia |
| **D-005** | Qual o tempo limite para a revogação de Blob URLs em memória (`URL.revokeObjectURL`) para evitar vazamento de memória na aplicação SPA (Single Page Application)?<br><br>**Opções:**<br>**(A)** Revogar 1.000 ms após o clique de download.<br>**(B)** Revogar no cleanup do hook (`useEffect`) quando o componente for desmontado.<br>**(C)** Ambos os mecanismos combinados. | A ausência de revogação de Blob URLs de vídeos e PDFs acumula consumo de memória RAM na aba do navegador. | Gerenciamento de Memória |
| **D-006** | Qual estado visual de erro deve ser exibido ao usuário caso o streaming da mídia falhe (ex.: ticket expirado, instabilidade de rede ou permissão negada)?<br><br>**Opções:**<br>**(A)** Exibir um componente de fallback com mensagem explicativa e botão "Tentar Novamente".<br>**(B)** Exibir uma notificação Toast de erro via sistema global de feedback. | Define a experiência de uso (UX) em cenários de indisponibilidade parcial de mídia. | UI e Error Handling |
| **D-007** | O player de vídeo em `IdeasVideoPlayerView` e `VideoEditor` deve continuar usando a tag nativa `<video>` ou adotar uma biblioteca dedicada (ex.: Video.js ou React Player)?<br><br>**Opções:**<br>**(A)** Manter a tag nativa `<video>` com suporte a `HTTP 206 Partial Content`.<br>**(B)** Adotar biblioteca dedicada. | Adoção de bibliotecas externas altera o tamanho do bundle JavaScript do frontend. | Players de Vídeo |

---

## 5. Critérios de aceite funcionais

Os critérios abaixo ficam estritamente condicionados à aprovação das decisões da Seção 4:

1. **Zero Exposição do S3:** Nenhuma ocorrência do termo `s3.amazonaws.com` ou referência ao bucket do S3 está presente no código-fonte, nos componentes React, no DOM renderizado ou na aba Network do navegador.
2. **Streaming Transparente via API:** O componente `MediaPreview` e os players de mídia transmitem mídias de upload exclusivamente consumindo a rota de streaming da API (`GET /media-items/:id/stream?ticket=...`).
3. **Suporte a Transferência Parcial:** Os elementos de áudio e vídeo reproduzem conteúdo por partes, permitindo avanço e recuo de reprodução (*seeking*) graças ao suporte `HTTP 206` fornecido pela API.
4. **Modal de Documentos Protegido:** O `MediaDocumentPreviewModal` renderiza visualizações de PDFs e documentos sem abrir abas `_blank` apontando para o S3.
5. **Download Seguro via API:** O `DownloadButton` executa o download do arquivo consumindo a rota dedicada da API (`GET /media-items/:id/download`) e preservando o nome original do arquivo.
6. **Mídias de Link Preservadas:** Mídias cadastradas por link externo (YouTube, Google Drive) mantêm sua funcionalidade de visualização original sem quebras de layout.
7. **Cancelamento Limpo:** Requisições de mídia interrompidas por navegação do usuário utilizam `AbortController` para cancelar a chamada sem emitir erros no console.
8. **Testes de Segurança:** Testes unitários e de componentes confirmam a renderização das URLs protegidas da API e o correto tratamento dos estados de carregamento e erro.

---

## 6. Arquitetura-alvo no Frontend

### 6.1 Fluxo de Componentes e consumo de Hooks

```text
       [ Componente React de Mídia ]
                     │
                     ├─► É mídia de UPLOAD (S3)?
                     │      │
                     │      ▼
                     │   useMediaStream(mediaId)
                     │      │
                     │      ├─► Axios POST /media-items/:id/ticket (Authorization: Bearer)
                     │      └─► Constrói streamUrl: `${API_BASE_URL}/media-items/${mediaId}/stream?ticket=${ticket}`
                     │
                     ├─► É mídia de LINK (YouTube/Drive)?
                     │      │
                     │      ▼
                     │   getMediaPreviewUrl(media)
                     │      └─► Retorna a URL de embed original da plataforma
                     │
                     └─► Ação de Download (DownloadButton):
                            │
                            ▼
                         useMediaDownload(mediaId, filename)
                            ├─► Axios GET /media-items/:id/download (responseType: 'blob')
                            ├─► Gera blobUrl = URL.createObjectURL(blob)
                            ├─► Dispara download no navegador
                            └─► URL.revokeObjectURL(blobUrl)
```

### 6.2 Estrutura de Arquivos Planejada

```text
clubinhonib-app/src/
├── utils/
│   ├── getMediaPreviewUrl.ts            # Refatorado para não retornar URLs do S3
│   ├── mediaStreamUtils.ts              # Funções para montagem de URLs protegidas de API
│   └── MediaDocumentPreviewModal.tsx    # Atualizado para consumir o streaming seguro
├── hooks/
│   ├── useMediaStream.ts                # Hook para gerenciar obtenção de ticket e URL de stream
│   └── useMediaDownload.ts              # Hook para gerenciar o fluxo de download por Blob/API
├── components/
│   └── common/
│       └── media/
│           └── MediaPreview.tsx         # Atualizado com suporte ao useMediaStream
└── pages/
    └── PageView/
        ├── WeekMaterialViewPage/
        │   └── DownloadButton.tsx       # Atualizado com o useMediaDownload
        └── IdeasMaterialViewpage/
            ├── DownloadButton.tsx
            └── IdeasVideoPlayerView.tsx # Atualizado com suporte ao stream seguro
```

---

## 7. Fases de implementação (condicionadas à aprovação da Seção 4)

### Fase 1: Criação dos Hooks e Utilitários de Mídia
1. Criar o utilitário `mediaStreamUtils.ts` com verificações de tipo de upload.
2. Implementar o hook `useMediaStream(mediaId: string)`:
   - Dispara a chamada Axios `POST /media-items/:id/ticket`.
   - Armazena o ticket e monta a URL de stream da API com `?ticket=...`.
   - Controla os estados `loading`, `error` e cancelamento por `AbortController`.
3. Implementar o hook `useMediaDownload`:
   - Executa a chamada de download seguro via Axios Blob ou acionamento da rota dedicada.
   - Gerencia a criação e a revogação automática de `blob:` URLs em memória.

### Fase 2: Refatoração do Utilitário `getMediaPreviewUrl.ts`
1. Atualizar `getMediaPreviewUrl.ts` para que mídias de `UPLOAD` nunca retornem a URL do S3.
2. Manter intactas as regras de formatação de preview para plataformas externas (Google Drive, Dropbox, OneDrive).

### Fase 3: Refatoração dos Componentes de Renderização
1. Atualizar `MediaPreview.tsx` para integrar o hook `useMediaStream` nos elementos `<video>`, `<audio>` e `<img>`.
2. Atualizar `IdeasVideoPlayerView.tsx` e `VideoEditor.tsx` para consumir o streaming protegido.

### Fase 4: Refatoração do Modal de Preview e Botões de Download
1. Refatorar `MediaDocumentPreviewModal.tsx`:
   - Remover as chamadas de `window.open(s3Url, '_blank')` e `fetch(s3Url)`.
   - Injetar o fluxo de streaming/blob seguro para exibição de documentos.
2. Refatorar `DownloadButton.tsx` (nas páginas `WeekMaterialViewPage` e `IdeasMaterialViewpage`):
   - Remover o repasse de URLs brutas do S3.
   - Integrar com o hook `useMediaDownload` para download seguro.

### Fase 5: Testes e Auditoria de Segurança
1. Desenvolver testes unitários para os novos hooks e utilitários.
2. Atualizar os testes dos componentes visuais (`MediaPreview.test.tsx`, `DownloadButton.test.tsx`).
3. Realizar testes de integração visual e auditoria da aba Network no navegador garantindo zero menções ao domínio `s3.amazonaws.com`.

---

## 8. Plano de testes e verificação

### 8.1 Testes Unitários de Frontend
- `useMediaStream.test.ts`: Verificar chamada à API de ticket e construção da URL com query string.
- `useMediaDownload.test.ts`: Verificar o disparo do download, tratamento de progresso e chamada de `URL.revokeObjectURL`.
- `MediaPreview.spec.tsx`: Testar a renderização da tag `<video>` com o atributo `src` apontando para a rota proxy da API.
- `DownloadButton.spec.tsx`: Testar interação de clique e transição de estados de carregamento.

### 8.2 Testes E2E e Auditoria de Rede
- Executar a aplicação frontend e abrir a aba Network das ferramentas de desenvolvedor.
- Navegar por materiais com vídeo, áudio, imagens e PDFs.
- **Validação de Segurança:** Verificar que **todas as requisições de mídia** são direcionadas para o domínio da API (ex.: `https://api.clubinhonib.com.br/media-items/...`) e que nenhuma requisição é enviada para `*.s3.amazonaws.com`.
- Clicar em botões de download e confirmar que o arquivo é baixado corretamente sem expor o S3 na caixa de diálogo do sistema operacional.

---

## 9. Plano de roll-back e contingência

1. **Rollback de Código:** Reverter os commits dos componentes visuais e hooks de mídia do frontend.
2. **Contingência de Transição:** Caso ocorra atraso na aprovação das decisões do backend, o utilitário `mediaStreamUtils.ts` pode ser mantido com uma flag de recurso (*Feature Flag*) desativada até a liberação final das APIs de streaming.
