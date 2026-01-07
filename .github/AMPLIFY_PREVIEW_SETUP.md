# 🚀 AWS Amplify PR Preview - Setup Completo

## 📋 O que foi implementado

Workflow completo para deploy automático de previews de PR usando **AWS Amplify** com subdomínios dinâmicos.

## ✨ Funcionalidades

- ✅ **Deploy automático** quando um PR é aberto/atualizado
- ✅ **Subdomínios dinâmicos**: `pr-[NÚMERO].clubinhonib.com`
- ✅ **Variáveis de ambiente de staging** configuradas automaticamente
- ✅ **Comentário automático no PR** com link da preview
- ✅ **Limpeza automática** quando o PR é fechado

## 🔧 Como funciona

1. **Quando um PR é criado/atualizado:**
   - Cria branch `pr-[NÚMERO]` no repositório
   - Cria branch correspondente no Amplify
   - Configura variáveis de ambiente de staging
   - Cria subdomínio `pr-[NÚMERO].clubinhonib.com`
   - Amplify faz build automaticamente
   - Comenta no PR com o link da preview

2. **Quando um PR é fechado:**
   - Remove a branch do Amplify
   - Remove o subdomínio

## 📋 Pré-requisitos

### Secrets do GitHub (já configurados):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### AWS Amplify:
- App Amplify `clubinhonib-app` deve existir
- Domínio `clubinhonib.com` deve estar configurado no Amplify
- Permissões AWS para:
  - `amplify:ListApps`
  - `amplify:GetBranch`
  - `amplify:CreateBranch`
  - `amplify:UpdateBranch`
  - `amplify:DeleteBranch`
  - `amplify:GetDomainAssociation`
  - `amplify:CreateDomainAssociation`
  - `amplify:UpdateDomainAssociation`
  - `amplify:ListJobs`

## 🌐 URLs dos Previews

Cada PR terá seu próprio subdomínio:
- **PR #90**: `https://pr-90.clubinhonib.com`
- **PR #91**: `https://pr-91.clubinhonib.com`
- E assim por diante...

## ⚙️ Variáveis de Ambiente

As seguintes variáveis são configuradas automaticamente em cada branch de preview:
- `VITE_API_URL`: https://staging-api.clubinhonib.com
- `VITE_FEED_MINISTERIO_ID`: afa51053-1296-4c89-9059-a8ad8bd1ec90
- `VITE_GOOGLE_CLIENT_ID`: 135271087774-favt17acohq7ope35eu48v41mi7lbshj.apps.googleusercontent.com
- `VITE_SPECIAL_FAMILY_DAY_ID`: a2f9913a-e123-46b2-b6f4-a4138686042f

## 🔍 Verificação

### Como verificar se está funcionando:

1. **Crie ou atualize um PR**
2. **Verifique o workflow** em Actions
3. **Aguarde o comentário no PR** com o link da preview
4. **Acesse o subdomínio** após alguns minutos (build do Amplify)

### Troubleshooting:

- **App não encontrado**: Verifique se o app `clubinhonib-app` existe no Amplify
- **Permissões**: Verifique se as credenciais AWS têm as permissões necessárias
- **Domínio**: Verifique se `clubinhonib.com` está configurado no Amplify
- **Build falhando**: Verifique os logs do Amplify no console AWS

## 📝 Arquivos

- `.github/workflows/pr-amplify-preview.yml` - Workflow principal

## 🎯 Vantagens sobre GitHub Pages

- ✅ Subdomínios próprios (mais profissional)
- ✅ Build gerenciado pelo Amplify (mais confiável)
- ✅ Integração nativa com AWS
- ✅ Melhor performance e CDN
- ✅ Limpeza automática de recursos

