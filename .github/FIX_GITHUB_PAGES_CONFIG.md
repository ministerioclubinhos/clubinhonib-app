# 🔧 Como Corrigir a Configuração do GitHub Pages

## ⚠️ Problema Identificado

Na captura de tela, vejo que o GitHub Pages está configurado com:
- **Source:** `GitHub Actions` ❌

Mas precisamos de:
- **Source:** `Deploy from a branch` ✅

## ✅ Solução Passo a Passo

### 1. Na página de configurações do GitHub Pages

Você está em: **Settings > Pages**

### 2. Alterar a Fonte

1. Na seção **"Build and deployment"**
2. No dropdown **"Source"** (atualmente mostra "GitHub Actions")
3. Clique no dropdown e selecione: **"Deploy from a branch"**

### 3. Configurar a Branch

Após selecionar "Deploy from a branch", aparecerão novos campos:

1. **Branch:**
   - No primeiro dropdown, selecione: **`gh-pages`**
   - No segundo dropdown (Folder), selecione: **`/ (root)`**

2. Clique em **"Save"**

### 4. Aguardar

- Aguarde alguns minutos (até 10 minutos)
- Você verá uma mensagem confirmando que o site está publicado

## 📸 O que você deve ver após configurar:

```
Build and deployment
Source: Deploy from a branch
Branch: gh-pages / (root)  [Save]
```

E uma mensagem verde:
```
Your site is published at https://ministerioclubinhos.github.io/clubinhonib-app/
```

## 🔍 Por que isso é necessário?

- **GitHub Actions:** Usa workflows do GitHub Actions para fazer deploy (não é nosso caso)
- **Deploy from a branch:** Serve arquivos diretamente de uma branch (é o que precisamos)

Nossos arquivos já estão na branch `gh-pages`, então só precisamos que o GitHub Pages sirva essa branch diretamente.

## ✅ Após configurar corretamente:

- `https://ministerioclubinhos.github.io/clubinhonib-app/` → Lista de previews
- `https://ministerioclubinhos.github.io/clubinhonib-app/previews/pr-90/` → Preview do PR #90

