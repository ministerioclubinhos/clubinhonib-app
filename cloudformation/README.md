# AWS CloudFormation - Clubinhos NIB

Infraestrutura como código (IaC) para deploy da aplicação Clubinhos NIB utilizando AWS Amplify e CloudFormation.

## � Estrutura

- `amplify-app.yaml`: Template principal da stack.
- `route53-dns.yaml`: Configuração de zonas DNS.
- `deploy.sh`: Script de automação de deploy.
- `parameters.json`: Arquivo de configuração de variáveis (Copie de `exemple.parameters.json`).

## 🚀 Deployment

### Pré-requisitos

- **AWS CLI** configurado com perfil `clubinho-aws`.
- **GitHub Personal Access Token** com escopos `repo` e `workflow`.
- **Domínio** `clubinhonib.com` gerenciado na conta AWS.

### Comandos

O script `deploy.sh` abstrai a complexidade do CloudFormation:

```bash
# Criar ou Atualizar a infraestrutura
./deploy.sh create clubinhonib-amplify-stack
./deploy.sh update clubinhonib-amplify-stack

# Remover infraestrutura
./deploy.sh delete clubinhonib-amplify-stack
```

## 🔗 Ambientes & CI/CD

A pipeline conecta o repositório GitHub ao AWS Amplify para deploy contínuo:

| Ambiente | Branch | URL |
|----------|--------|-----|
| **Produção** | `main` | [clubinhonib.com](https://clubinhonib.com) |
| **Staging** | `staging` | [staging.clubinhonib.com](https://staging.clubinhonib.com) |

> **Nota**: Após o primeiro deploy, configure o webhook no AWS Amplify Console para conectar o repositório GitHub usando seu Personal Access Token.
