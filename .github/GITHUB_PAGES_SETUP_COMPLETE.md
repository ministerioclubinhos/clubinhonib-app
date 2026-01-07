# 🚀 Guia Completo: Habilitar GitHub Pages para Previews de PR

Baseado na [documentação oficial do GitHub Pages](https://docs.github.com/pt/pages/quickstart)

## 📋 Situação Atual

- ✅ Workflow funcionando e fazendo deploy
- ✅ Arquivos sendo deployados na branch `gh-pages`
- ✅ Arquivo `index.html` criado na raiz
- ✅ Arquivo `.nojekyll` presente
- ⚠️ **GitHub Pages precisa ser habilitado manualmente**

## 🔧 Passo a Passo para Habilitar

Seguindo a [documentação oficial do GitHub Pages](https://docs.github.com/pt/pages/quickstart):

### 1. Acesse as Configurações do Repositório

1. No repositório `clubinhonib-app`, clique na aba **"Configurações"** (Settings)
2. Na seção **"Code and automation"** da barra lateral, clique em **"Pages"**

Ou acesse diretamente: **https://github.com/ministerioclubinhos/clubinhonib-app/settings/pages**

### 2. Configure a Fonte de Publicação

Na seção **"Build e implantação"** (Build and deployment):

1. Em **"Fonte"** (Source), selecione: **"Fazer implantação de um branch"** (Deploy from a branch)
2. Em **"Branch"**:
   - Use o menu suspenso e selecione: **`gh-pages`**
   - Selecione o diretório: **`/ (root)`**
3. Clique em **"Salvar"** (Save)

### 3. Aguarde a Publicação

- Pode levar **até 10 minutos** para o site ficar disponível
- Você verá uma mensagem confirmando que o site está publicado em:
  ```
  https://ministerioclubinhos.github.io/clubinhonib-app/
  ```

### 3. Aguarde a Publicação

- Pode levar **até 10 minutos** para o site ficar disponível
- Você verá uma mensagem verde confirmando que o site está publicado

## 🌐 URLs dos Previews

Após habilitar, os previews estarão disponíveis em:

- **Página inicial (lista de previews):**
  ```
  https://ministerioclubinhos.github.io/clubinhonib-app/
  ```

- **Preview do PR #90:**
  ```
  https://ministerioclubinhos.github.io/clubinhonib-app/previews/pr-90/
  ```

- **Preview de qualquer PR:**
  ```
  https://ministerioclubinhos.github.io/clubinhonib-app/previews/pr-[NÚMERO]/
  ```

## ✅ Verificação

### Como verificar se está funcionando:

1. **Aguarde alguns minutos** após habilitar
2. Acesse: `https://ministerioclubinhos.github.io/clubinhonib-app/`
3. Você deve ver:
   - A página inicial com lista de previews disponíveis, OU
   - O preview do PR #90 diretamente

### Se ainda aparecer 404:

1. **Verifique se o GitHub Pages está habilitado:**
   - Vá em Settings > Pages
   - Deve mostrar "Your site is published at..."

2. **Verifique a branch:**
   - Deve estar configurada como `gh-pages` / `/ (root)`

3. **Limpe o cache do navegador:**
   - Use modo anônimo ou limpe o cache

4. **Aguarde mais alguns minutos:**
   - O GitHub pode levar até 10 minutos para propagar

## 📝 Diferenças: Site de Usuário vs Repositório de Projeto

A [documentação oficial](https://docs.github.com/pt/pages/quickstart) foca em **sites de usuário** (`username.github.io`), mas estamos usando um **repositório de projeto**:

### Site de Usuário (documentação oficial):
- Repositório deve ser nomeado: `username.github.io`
- URL: `https://username.github.io`
- Exemplo: `octocat.github.io`

### Repositório de Projeto (nosso caso):
- ✅ **Não precisa** criar um repositório especial
- ✅ **Não precisa** renomear o repositório
- ✅ Funciona com qualquer nome de repositório
- ✅ A URL será: `https://username.github.io/nome-do-repositorio/`
- ✅ No nosso caso: `https://ministerioclubinhos.github.io/clubinhonib-app/`

**Ambos usam o mesmo processo de configuração** (Settings > Pages > Deploy from a branch), apenas a URL final é diferente.

## 🔍 Estrutura Esperada na Branch `gh-pages`

```
gh-pages/
├── .nojekyll          # Necessário para servir todos os arquivos
├── index.html         # Página inicial (lista de previews)
└── previews/
    ├── pr-90/         # Preview do PR #90
    │   ├── index.html
    │   ├── assets/
    │   └── ...
    └── pr-[NÚMERO]/   # Outros previews
```

## 🎯 Próximos Passos

Após habilitar o GitHub Pages:

1. ✅ O workflow continuará fazendo deploy automaticamente
2. ✅ Cada novo PR terá seu preview criado automaticamente
3. ✅ O comentário no PR terá o link da preview
4. ✅ Você poderá testar as mudanças antes de fazer merge

## 🆘 Troubleshooting

### Erro: "There isn't a GitHub Pages site here"

**Causas possíveis:**
- GitHub Pages não está habilitado
- Branch incorreta selecionada
- Repositório privado (precisa ser público ou ter plano pago)

**Solução:**
1. Verifique Settings > Pages
2. Confirme que está usando branch `gh-pages`
3. Se o repositório for privado, torne-o público ou atualize o plano

### Preview não carrega corretamente

**Causas possíveis:**
- Arquivo `index.html` faltando no preview
- Problemas com rotas do React (SPA)

**Solução:**
- O workflow já cria o `index.html` automaticamente
- Para SPAs, pode ser necessário configurar redirects (já incluído no workflow)

## 📚 Referências

- [Documentação oficial do GitHub Pages](https://docs.github.com/pages)
- [Troubleshooting 404 errors](https://docs.github.com/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites)

