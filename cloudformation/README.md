# CloudFormation - Clubinho NIB Amplify App

Este diretório contém os templates e scripts para deploy da aplicação Clubinho NIB no AWS Amplify usando CloudFormation.

## 📁 Arquivos

- `amplify-app.yaml` - Template CloudFormation principal
- `parameters.json` - Parâmetros para o deploy
- `deploy.sh` - Script automatizado de deploy
- `README.md` - Este arquivo

## 🚀 Como fazer o deploy

### Pré-requisitos

1. **AWS CLI configurado** com o perfil `clubinho-aws`:
   ```bash
   aws configure --profile clubinho-aws
   ```

2. **Domínio `clubinhonib.com` controlado** pela conta AWS do perfil `clubinho-aws`

3. **GitHub Personal Access Token** (será configurado manualmente no console):
   - Crie um token em [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Permissões necessárias:
     - `repo` (Full control of private repositories)
     - `workflow` (Update GitHub Action workflows)
   - **IMPORTANTE**: Guarde o token, será usado no passo 4 dos pós-deploy

3. **Repositório GitHub** configurado (atualmente aponta para `https://github.com/diego-seven/clubinhonib-app`)

### Deploy da Stack

#### Criar a stack (primeira vez):
```bash
./deploy.sh create clubinhonib-amplify-stack
```

#### Atualizar a stack (deploy de mudanças):
```bash
./deploy.sh update clubinhonib-amplify-stack
```

#### Deletar a stack:
```bash
./deploy.sh delete clubinhonib-amplify-stack
```

## 🏗️ O que a stack cria

### AWS Amplify App
- **Nome**: `clubinhonib-app`
- **Build settings** otimizadas para Vite + React
- **Auto-build** habilitado para branches
- **NOTA**: O repositório GitHub será conectado manualmente no console

### Branches configuradas
- **Branches serão criadas manualmente** no console após conectar o repositório
- **`main`** → Produção (será configurado para `clubinhonib.com`)
- **`staging`** → Staging (será configurado para `staging.clubinhonib.com`)

### Environment Variables
Cada branch tem suas próprias variáveis de ambiente:
- `VITE_API_URL`
- `VITE_FEED_MINISTERIO_ID`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_SPECIAL_FAMILY_DAY_ID`

### Domínios
- **Produção**: `https://clubinhonib.com`
- **Staging**: `https://staging.clubinhonib.com`

## 🔧 Configurações pós-deploy

Após o deploy bem-sucedido, você precisará:

1. **Configurar webhook do GitHub**:
   - Acesse o [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Selecione a app `clubinhonib-app`
   - Vá para "App settings" > "Repository"
   - Clique em "Connect to repository"
   - Selecione GitHub e faça login
   - Cole o Personal Access Token criado anteriormente
   - Selecione o repositório `clubinhonib/clubinhonib-app`
   - Configure webhooks para auto-deploy das branches `main` e `staging`

2. **Criar branches no Amplify**:
   - No Amplify Console, vá para "App settings" > "Branch settings"
   - Clique em "Add branch" para cada branch:
     - **Branch main**: Ambiente de produção
     - **Branch staging**: Ambiente de staging
   - Configure as environment variables para cada branch (conforme parameters.json)

3. **Configurar domínios**:
   - Vá para "App settings" > "Domain management"
   - Adicione o domínio `clubinhonib.com`
   - Configure subdomínios:
     - `clubinhonib.com` → branch `main`
     - `staging.clubinhonib.com` → branch `staging`

2. **Configurar domínio no Route 53** (se necessário):
   - Verifique se `clubinhonib.com` está configurado no Route 53
   - O Amplify criará os registros necessários automaticamente

3. **Fazer push das branches**:
   ```bash
   git checkout main
   git push origin main

   git checkout -b staging
   git push origin staging
   ```

## 📊 Monitoramento

### Ver status da stack:
```bash
aws cloudformation describe-stacks \
  --stack-name clubinhonib-amplify-stack \
  --profile clubinho-aws \
  --region us-east-1
```

### Ver outputs da stack:
```bash
aws cloudformation describe-stacks \
  --stack-name clubinhonib-amplify-stack \
  --profile clubinho-aws \
  --region us-east-1 \
  --query 'Stacks[0].Outputs'
```

### Logs de build:
- Acesse o AWS Amplify Console
- Vá para a app `clubinhonib-app`
- Clique em "Build settings" > "Build history"

## 🔍 Troubleshooting

### Stack falha ao criar:
- Verifique se o perfil `clubinho-aws` tem permissões adequadas
- Confirme que o domínio `clubinhonib.com` está na conta AWS correta

### Build falha no Amplify:
- Verifique os logs no Amplify Console
- Confirme que todas as environment variables estão configuradas
- Verifique se o repositório GitHub está acessível

### Domínio não funciona:
- Aguarde a propagação do DNS (pode levar até 24h)
- Verifique se os registros CNAME estão criados no Route 53
- Confirme que o domínio não está sendo usado por outro serviço

## 🏷️ Outputs da Stack

A stack exporta os seguintes valores:
- `AmplifyAppId` - ID da aplicação Amplify
- `ProductionBranchName` - Nome da branch de produção
- `StagingBranchName` - Nome da branch de staging
- `ProductionDomain` - URL de produção
- `StagingDomain` - URL de staging

## 📝 Personalização

Para modificar configurações:

1. **Environment variables**: Edite o `parameters.json`
2. **Build settings**: Modifique o `BuildSpec` no `amplify-app.yaml`
3. **Branches**: Altere os parâmetros `RepositoryBranch` e `StagingBranch`
4. **Domínios**: Modifique a seção `DomainAssociation`

Após mudanças, execute:
```bash
./deploy.sh update clubinhonib-amplify-stack
```
