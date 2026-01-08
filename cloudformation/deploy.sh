#!/bin/bash

# Script de deploy da stack CloudFormation para Clubinho NIB Amplify App
# Uso:
#   ./deploy.sh [create|update|delete|apply|status|deploy] STACK_NAME [--yes] [--recreate] [--profile P] [--region R] [--template FILE] [--parameters FILE]
#
# Notas:
# - Por padrão usa o profile local 'clubinho-aws' (pode sobrescrever via --profile).
# - "apply" faz create se não existir; caso exista faz update.
# - "recreate" deleta e recria automaticamente quando a stack está em estados que impedem update.
# - "deploy" orquestra tudo: apply -> DNS Route53 -> aguarda domínio -> dispara deploy main+staging.

set -euo pipefail

# Defaults (podem ser sobrescritos por flags)
TEMPLATE_FILE="amplify-app.yaml"
PARAMETERS_FILE="parameters.json"
PROFILE="clubinho-aws"
REGION="us-east-1"
ASSUME_YES="false"
RECREATE_ON_BLOCKED_STATUS="false"
GITHUB_TOKEN_ENV="AMPLIFY_GITHUB_TOKEN"
GITHUB_TOKEN_SECRET_ID=""
ROUTE53_HOSTED_ZONE_ID=""
ROOT_DOMAIN_NAME="clubinhonib.com"
STAGING_SUBDOMAIN_PREFIX="staging"
WAIT_DOMAIN_SECONDS="900"
SKIP_ENV_VALIDATE="false"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

usage() {
  cat <<EOF
Uso: $0 [create|update|delete|apply|status] STACK_NAME [opções]

Opções:
  --yes            Não pedir confirmação (non-interactive)
  --recreate       Se a stack estiver em estados bloqueados (ROLLBACK/FAILED), deleta e recria automaticamente
  --profile P      AWS CLI profile (default: clubinho-aws)
  --region R       AWS region (default: us-east-1)
  --template FILE  Template CloudFormation (default: amplify-app.yaml)
  --parameters FILE Parâmetros CloudFormation (default: parameters.json)
  --github-token-env VAR  Nome da env var que contém o GitHub token (default: AMPLIFY_GITHUB_TOKEN)
  --github-token-secret SECRET_ID  Secret no AWS Secrets Manager com o token (fallback quando env var não existe)
  --hosted-zone-id Z     Hosted Zone ID do Route53 (opcional; se omitido tenta descobrir por RootDomainName)
  --root-domain NAME     Domínio raiz (default: clubinhonib.com)
  --staging-prefix PFX   Prefixo do subdomínio de staging (default: staging)
  --wait-domain-seconds N  Tempo máximo para esperar o domínio progredir (default: 900)
  --skip-env-validate    Não validar envs do parameters.json vs env/env.prod e env/env.staging

Exemplos:
  $0 apply  clubinhonib-amplify-staging --recreate --yes
  $0 deploy clubinhonib-amplify --recreate --yes --root-domain clubinhonib.com --staging-prefix staging
  $0 create clubinhonib-amplify-staging --yes
  $0 update clubinhonib-amplify-staging --recreate --yes
  $0 delete clubinhonib-amplify-staging --yes
EOF
}

if [ $# -lt 2 ]; then
  usage
  exit 1
fi

ACTION="$1"
STACK_NAME="$2"
shift 2

while [ $# -gt 0 ]; do
  case "$1" in
    --yes)
      ASSUME_YES="true"
      shift
      ;;
    --recreate)
      RECREATE_ON_BLOCKED_STATUS="true"
      shift
      ;;
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --template)
      TEMPLATE_FILE="$2"
      shift 2
      ;;
    --parameters)
      PARAMETERS_FILE="$2"
      shift 2
      ;;
    --github-token-env)
      GITHUB_TOKEN_ENV="$2"
      shift 2
      ;;
    --github-token-secret)
      GITHUB_TOKEN_SECRET_ID="$2"
      shift 2
      ;;
    --hosted-zone-id)
      ROUTE53_HOSTED_ZONE_ID="$2"
      shift 2
      ;;
    --root-domain)
      ROOT_DOMAIN_NAME="$2"
      shift 2
      ;;
    --staging-prefix)
      STAGING_SUBDOMAIN_PREFIX="$2"
      shift 2
      ;;
    --wait-domain-seconds)
      WAIT_DOMAIN_SECONDS="$2"
      shift 2
      ;;
    --skip-env-validate)
      SKIP_ENV_VALIDATE="true"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      error "Flag desconhecida: $1"
      usage
      exit 1
      ;;
  esac
done

require_aws() {
  aws sts get-caller-identity --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1 || {
    error "Falha ao autenticar com AWS CLI (profile=$PROFILE region=$REGION)."
    exit 1
  }
}

param_get() {
  # Lê um ParameterValue do arquivo JSON (lista) `parameters.json`.
  # Retorna string vazia quando não existe.
  local key="$1"
  python3 - "$PARAMETERS_FILE" "$key" <<'PY'
import json, sys
path = sys.argv[1]
key = sys.argv[2]
try:
  params = json.load(open(path, "r", encoding="utf-8"))
except Exception:
  print("")
  sys.exit(0)
for p in params if isinstance(params, list) else []:
  if p.get("ParameterKey") == key:
    print(p.get("ParameterValue", "") or "")
    break
else:
  print("")
PY
}

env_file_to_json() {
  # Converte env file KEY=VALUE para JSON map (para `aws amplify update-branch --environment-variables`).
  # Também valida presença das chaves essenciais.
  local env_file="$1"
  python3 - "$env_file" <<'PY'
import json, sys
env_path = sys.argv[1]
required = [
  "VITE_API_URL",
  "VITE_FEED_MINISTERIO_ID",
  "VITE_GOOGLE_CLIENT_ID",
  "VITE_SPECIAL_FAMILY_DAY_ID",
]
actual = {}
with open(env_path, "r", encoding="utf-8") as f:
  for line in f:
    line = line.strip()
    if not line or line.startswith("#"):
      continue
    if "=" not in line:
      continue
    k, v = line.split("=", 1)
    k = k.strip()
    v = v.strip()
    actual[k] = v

missing = [k for k in required if not actual.get(k)]
if missing:
  print("")
  sys.exit(0)

# filtra apenas VITE_* (evita vazar lixo pro Amplify)
vite_only = {k: v for k, v in actual.items() if k.startswith("VITE_")}
print(json.dumps(vite_only, ensure_ascii=False))
PY
}

apply_branch_env_vars() {
  local app_id="$1"
  local branch_name="$2"
  local env_json="$3"

  if [ -z "$env_json" ]; then
    error "Env JSON vazio para branch '$branch_name' (app=$app_id). Verifique cloudformation/parameters.json."
    return 1
  fi

  log "Aplicando envs no Amplify: app=$app_id branch=$branch_name"
  aws amplify update-branch \
    --app-id "$app_id" \
    --branch-name "$branch_name" \
    --environment-variables "$env_json" \
    --profile "$PROFILE" \
    --region "$REGION" >/dev/null

  success "Env vars atualizadas: branch=$branch_name"
}

get_github_token() {
  # 1) tenta env var local
  local token=""
  if printenv "$GITHUB_TOKEN_ENV" >/dev/null 2>&1; then
    token="$(printenv "$GITHUB_TOKEN_ENV" || true)"
  fi

  if [ -n "$token" ]; then
    echo "$token"
    return 0
  fi

  # 2) fallback: AWS Secrets Manager
  if [ -n "$GITHUB_TOKEN_SECRET_ID" ]; then
    token="$(aws secretsmanager get-secret-value \
      --secret-id "$GITHUB_TOKEN_SECRET_ID" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --query 'SecretString' \
      --output text 2>/dev/null || true)"
    if [ "$token" != "None" ] && [ -n "$token" ]; then
      echo "$token"
      return 0
    fi
  fi

  echo ""
  return 0
}

get_stack_output() {
  local key="$1"
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue | [0]" \
    --output text 2>/dev/null || true
}

discover_hosted_zone_id() {
  local domain="$1"
  local id
  id="$(aws route53 list-hosted-zones-by-name \
    --dns-name "$domain" \
    --profile "$PROFILE" \
    --query 'HostedZones[0].Id' \
    --output text 2>/dev/null || true)"
  id="${id##*/}"
  if [ -n "$id" ] && [ "$id" != "None" ]; then
    echo "$id"
    return 0
  fi
  echo ""
  return 0
}

ensure_route53_records_from_amplify() {
  local app_id="$1"
  local domain="$2"
  local staging_prefix="$3"

  local hz="${ROUTE53_HOSTED_ZONE_ID}"
  if [ -z "$hz" ]; then
    hz="$(discover_hosted_zone_id "$domain")"
  fi
  if [ -z "$hz" ]; then
    error "HostedZoneId não encontrado para '$domain'. Passe --hosted-zone-id."
    return 1
  fi

  # Pega json da domain association (pode demorar alguns segundos até o Amplify preencher DNS records)
  local da_json rc
  for _ in $(seq 1 30); do # ~5min
    set +e
    da_json="$(aws amplify get-domain-association \
      --app-id "$app_id" \
      --domain-name "$domain" \
      --profile "$PROFILE" \
      --region "$REGION" \
      --output json 2>/dev/null)"
    rc=$?
    set -e
    if [ $rc -eq 0 ] && [ -n "${da_json:-}" ]; then
      break
    fi
    sleep 10
  done
  if [ -z "${da_json:-}" ]; then
    error "Não consegui ler DomainAssociation no Amplify (app=$app_id domain=$domain)."
    error "Dica: verifique se o recurso DomainAssociation existe na stack e se já foi criado no Amplify."
    return 1
  fi

  # Extrai cert record e target cloudfront (do subdomain main)
  local cert_name cert_value cf_target
  read -r cert_name cert_value cf_target < <(python3 - <<'PY'
import json,sys
raw=sys.stdin.read().strip()
if not raw:
    print("", "", "")
    sys.exit(0)
j=json.loads(raw)
da=j.get("domainAssociation",{})
cert=da.get("certificateVerificationDNSRecord") or da.get("certificate",{}).get("certificateVerificationDNSRecord") or ""
cert_name=cert_value=""
if cert:
    parts=[p for p in cert.strip().split(" ") if p]
    if len(parts)>=3:
        cert_name=parts[0]
        cert_value=parts[2]
        if not cert_name.endswith("."): cert_name += "."
        if not cert_value.endswith("."): cert_value += "."

cf_target=""
for sd in da.get("subDomains",[]):
    setting=sd.get("subDomainSetting") or {}
    if setting.get("branchName")=="main" and not setting.get("prefix"):
        rec=(sd.get("dnsRecord") or "").strip()
        p=[x for x in rec.split(" ") if x]
        if len(p)==2: cf_target=p[1]
        elif len(p)>=3: cf_target=p[2]
        break
if not cf_target and da.get("subDomains"):
    rec=(da["subDomains"][0].get("dnsRecord") or "").strip()
    p=[x for x in rec.split(" ") if x]
    if len(p)==2: cf_target=p[1]
    elif len(p)>=3: cf_target=p[2]
if cf_target and not cf_target.endswith("."): cf_target += "."
print(cert_name, cert_value, cf_target)
PY
  <<<"$da_json")

  if [ -z "$cf_target" ] || [ -z "$cert_name" ] || [ -z "$cert_value" ]; then
    # tenta reconsultar por mais um tempo
    for _ in $(seq 1 30); do
      sleep 10
      da_json="$(aws amplify get-domain-association --app-id "$app_id" --domain-name "$domain" --profile "$PROFILE" --region "$REGION" --output json 2>/dev/null || true)"
      read -r cert_name cert_value cf_target < <(python3 - <<'PY'
import json,sys
raw=sys.stdin.read().strip()
if not raw:
    print("", "", "")
    sys.exit(0)
j=json.loads(raw)
da=j.get("domainAssociation",{})
cert=da.get("certificateVerificationDNSRecord") or da.get("certificate",{}).get("certificateVerificationDNSRecord") or ""
cert_name=cert_value=""
if cert:
    parts=[p for p in cert.strip().split(" ") if p]
    if len(parts)>=3:
        cert_name=parts[0]
        cert_value=parts[2]
        if not cert_name.endswith("."): cert_name += "."
        if not cert_value.endswith("."): cert_value += "."
cf_target=""
for sd in da.get("subDomains",[]):
    setting=sd.get("subDomainSetting") or {}
    if setting.get("branchName")=="main" and not setting.get("prefix"):
        rec=(sd.get("dnsRecord") or "").strip()
        p=[x for x in rec.split(" ") if x]
        if len(p)==2: cf_target=p[1]
        elif len(p)>=3: cf_target=p[2]
        break
if not cf_target and da.get("subDomains"):
    rec=(da["subDomains"][0].get("dnsRecord") or "").strip()
    p=[x for x in rec.split(" ") if x]
    if len(p)==2: cf_target=p[1]
    elif len(p)>=3: cf_target=p[2]
if cf_target and not cf_target.endswith("."): cf_target += "."
print(cert_name, cert_value, cf_target)
PY
<<<"$da_json")
      if [ -n "$cf_target" ] && [ -n "$cert_name" ] && [ -n "$cert_value" ]; then
        break
      fi
    done
  fi
  if [ -z "$cf_target" ] || [ -z "$cert_name" ] || [ -z "$cert_value" ]; then
    error "Amplify ainda não retornou DNS records suficientes (cf_target/cert) após aguardar. Tente novamente."
    return 1
  fi

  # CloudFront hosted zone id global
  local cf_zone_id="Z2FDTNDATAQYW2"

  local tmp="/tmp/route53-${STACK_NAME}-dns.json"
  cat > "$tmp" <<JSON
{
  "Comment": "Amplify domain association DNS (orchestrated by deploy.sh)",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${domain}.",
        "Type": "A",
        "AliasTarget": { "HostedZoneId": "${cf_zone_id}", "DNSName": "${cf_target}", "EvaluateTargetHealth": false }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${domain}.",
        "Type": "AAAA",
        "AliasTarget": { "HostedZoneId": "${cf_zone_id}", "DNSName": "${cf_target}", "EvaluateTargetHealth": false }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.${domain}.",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{ "Value": "${cf_target}" }]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${staging_prefix}.${domain}.",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{ "Value": "${cf_target}" }]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${cert_name}",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{ "Value": "${cert_value}" }]
      }
    }
  ]
}
JSON

  aws route53 change-resource-record-sets \
    --hosted-zone-id "$hz" \
    --change-batch "file://$tmp" \
    --profile "$PROFILE" \
    --region "$REGION" >/dev/null

  success "DNS atualizado no Route53 (HostedZoneId=$hz) para ${domain}, www.${domain} e ${staging_prefix}.${domain}"
}

wait_domain_ready() {
  local app_id="$1"
  local domain="$2"
  local max="${WAIT_DOMAIN_SECONDS}"
  local start
  start="$(date +%s)"
  while true; do
    status="$(aws amplify get-domain-association --app-id "$app_id" --domain-name "$domain" --profile "$PROFILE" --region "$REGION" --query 'domainAssociation.domainStatus' --output text 2>/dev/null || true)"
    log "DomainStatus=${status}"
    if [ "$status" = "AVAILABLE" ]; then
      success "Domínio AVAILABLE: $domain"
      return 0
    fi
    if [ "$status" = "FAILED" ] || [ "$status" = "ERROR" ]; then
      error "Domínio falhou: $status"
      return 1
    fi
    now="$(date +%s)"
    if [ $((now-start)) -ge "$max" ]; then
      warning "Timeout aguardando domínio progredir (status atual: $status)."
      return 2
    fi
    sleep 10
  done
}

start_amplify_deploys() {
  local app_id="$1"
  local prod_branch staging_branch
  prod_branch="$(param_get "RepositoryBranch")"
  staging_branch="$(param_get "StagingBranch")"
  if [ -z "${prod_branch:-}" ]; then prod_branch="main"; fi
  if [ -z "${staging_branch:-}" ]; then staging_branch="staging"; fi

  for br in "$staging_branch" "$prod_branch"; do
    log "Disparando deploy: app=$app_id branch=$br"
    aws amplify start-job --app-id "$app_id" --branch-name "$br" --job-type RELEASE --profile "$PROFILE" --region "$REGION" >/dev/null
  done
  success "Deploys disparados (main + staging)."
}

make_parameters_file() {
  # Cria um arquivo temporário de parâmetros para CloudFormation.
  # - Em create: GitHubAccessToken é obrigatório (sem ele o Amplify não conecta no repo)
  # - Em update: se token não for fornecido, usa UsePreviousValue=true
  #
  # arg1: require_token ("true"|"false")
  local require_token="${1:-false}"
  local tmp
  tmp="$(mktemp)"

  # Copia parameters.json (lista) para tmp
  cp "$PARAMETERS_FILE" "$tmp"

  # Se não houver python3, falha (dependência mínima)
  if ! command -v python3 >/dev/null 2>&1; then
    error "python3 é necessário para montar o arquivo temporário de parâmetros."
    exit 1
  fi

  local token
  token="$(get_github_token)"

  python3 - "$tmp" "$token" "$require_token" <<'PY'
import json, sys
path = sys.argv[1]
token = sys.argv[2] or ""
require_token = (sys.argv[3] or "").lower() == "true"

params = json.load(open(path, "r", encoding="utf-8"))

# Mantém APENAS os parâmetros que existem no template CloudFormation.
# As env vars (Prod*/Staging*) são lidas pelo deploy.sh e aplicadas via Amplify API, não via CloudFormation.
allowed = {
  "RepositoryUrl",
  "RepositoryBranch",
  "StagingBranch",
  "RootDomainName",
  "StagingSubdomainPrefix",
  "GitHubAccessToken",
}
params = [p for p in params if p.get("ParameterKey") in allowed]

# GitHubAccessToken:
# - se token foi fornecido, injeta valor
# - se token NÃO foi fornecido:
#   - em create (require_token=True): deixa sem valor, o bash vai falhar antes
#   - em update (require_token=False): UsePreviousValue=True para não exigir reenvio do token
params = [p for p in params if p.get("ParameterKey") != "GitHubAccessToken"]
if token:
    params.append({"ParameterKey": "GitHubAccessToken", "ParameterValue": token})
elif not require_token:
    params.append({"ParameterKey": "GitHubAccessToken", "UsePreviousValue": True})

json.dump(params, open(path, "w", encoding="utf-8"), indent=2)
PY

  echo "$tmp"
}

# Verifica se o perfil AWS existe
if ! aws configure list-profiles | grep -q "^${PROFILE}$"; then
    error "Perfil AWS '${PROFILE}' não encontrado. Configure-o primeiro:"
    echo "aws configure --profile ${PROFILE}"
    exit 1
fi

# Verifica se os arquivos existem
if [ ! -f "$TEMPLATE_FILE" ]; then
    error "Arquivo de template '$TEMPLATE_FILE' não encontrado!"
    exit 1
fi

if [ ! -f "$PARAMETERS_FILE" ]; then
    error "Arquivo de parâmetros '$PARAMETERS_FILE' não encontrado!"
    exit 1
fi

stack_exists() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" >/dev/null 2>&1
}

get_stack_status() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION" \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || true
}

is_in_progress_status() {
  case "$1" in
    *_IN_PROGRESS|*_CLEANUP_IN_PROGRESS|REVIEW_IN_PROGRESS)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

is_blocked_status() {
  case "$1" in
    ROLLBACK_COMPLETE|UPDATE_ROLLBACK_COMPLETE|CREATE_FAILED|UPDATE_ROLLBACK_FAILED|ROLLBACK_FAILED|IMPORT_ROLLBACK_COMPLETE|IMPORT_ROLLBACK_FAILED)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

wait_until_not_in_progress() {
  local status
  status="$(get_stack_status)"
  if [ -z "$status" ]; then
    return 0
  fi

  if ! is_in_progress_status "$status"; then
    return 0
  fi

  log "Stack está em progresso ($status). Aguardando finalizar..."
  while true; do
    sleep 10
    status="$(get_stack_status)"
    if [ -z "$status" ]; then
      break
    fi
    if ! is_in_progress_status "$status"; then
      log "Stack saiu de IN_PROGRESS: $status"
      break
    fi
  done
}

delete_stack_force() {
  if ! stack_exists; then
    success "Stack não existe; nada para deletar."
    return 0
  fi

  wait_until_not_in_progress
  local status
  status="$(get_stack_status)"

  log "Deletando stack CloudFormation: $STACK_NAME (status atual: $status)"
  aws cloudformation delete-stack \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION"

  # Espera até sumir
  log "Aguardando delete completar..."
  while stack_exists; do
    sleep 10
  done
  success "Stack deletada com sucesso!"
}

create_stack() {
  log "Criando stack CloudFormation: $STACK_NAME"
  log "Perfil AWS: $PROFILE"
  log "Região: $REGION"

  local params_file
  params_file="$(make_parameters_file "true")"

  # Se o template espera token e não foi fornecido, falha cedo (evita app "manual deploy")
  if grep -q "GitHubAccessToken" "$TEMPLATE_FILE"; then
    token_val="$(get_github_token)"
    if [ -z "${token_val:-}" ]; then
      error "Falta o token do GitHub."
      error "- Opção 1: exporte a env var '$GITHUB_TOKEN_ENV' e rode de novo."
      error "  Exemplo: export ${GITHUB_TOKEN_ENV}='ghp_...'"
      error "- Opção 2: informe um secret do Secrets Manager via --github-token-secret (recomendado)."
      rm -f "$params_file"
      exit 1
    fi
  fi

  aws cloudformation create-stack \
    --stack-name "$STACK_NAME" \
    --template-body "file://$TEMPLATE_FILE" \
    --parameters "file://$params_file" \
    --capabilities CAPABILITY_IAM \
    --profile "$PROFILE" \
    --region "$REGION"

  log "Aguardando create completar..."
  aws cloudformation wait stack-create-complete \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION"
  success "Stack create concluída com sucesso!"

  rm -f "$params_file"
}

update_stack() {
  log "Atualizando stack CloudFormation: $STACK_NAME"

  local params_file
  params_file="$(make_parameters_file "false")"

  if grep -q "GitHubAccessToken" "$TEMPLATE_FILE"; then
    token_val="$(get_github_token)"
    if [ -z "${token_val:-}" ]; then
      warning "GitHub token não fornecido. Em UPDATE vamos usar UsePreviousValue=true para GitHubAccessToken."
    fi
  fi

  # update-stack retorna exit code 255 em "No updates are to be performed."
  set +e
  out=$(aws cloudformation update-stack \
    --stack-name "$STACK_NAME" \
    --template-body "file://$TEMPLATE_FILE" \
    --parameters "file://$params_file" \
    --capabilities CAPABILITY_IAM \
    --profile "$PROFILE" \
    --region "$REGION" 2>&1)
  rc=$?
  set -e

  if [ $rc -ne 0 ]; then
    if echo "$out" | grep -qi "No updates are to be performed"; then
      success "Nenhuma atualização necessária (No updates are to be performed)."
      return 0
    fi
    error "Falha ao chamar update-stack:"
    echo "$out"
    return 1
  fi

  log "Aguardando update completar..."
  aws cloudformation wait stack-update-complete \
    --stack-name "$STACK_NAME" \
    --profile "$PROFILE" \
    --region "$REGION"
  success "Stack update concluída com sucesso!"

  rm -f "$params_file"
}

case "$ACTION" in
  status)
    if ! stack_exists; then
      echo "STACK_NOT_FOUND"
      exit 0
    fi
    get_stack_status
    exit 0
    ;;

  create)
    if stack_exists; then
      wait_until_not_in_progress
      status="$(get_stack_status)"
      warning "Stack já existe (status: $status)."

      if is_blocked_status "$status"; then
        if [ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] || [ "$ASSUME_YES" = "true" ]; then
          warning "Status bloqueado ($status). Recriando stack automaticamente..."
          delete_stack_force
          create_stack
        else
          error "Status bloqueado ($status). Rode: $0 delete $STACK_NAME --yes  (ou use --recreate)."
          exit 1
        fi
      else
        error "Para stack existente use 'update' ou 'apply'."
        exit 1
      fi
    else
      create_stack
    fi
    ;;

  update)
    if ! stack_exists; then
      warning "Stack não existe; fazendo create."
      create_stack
    else
      wait_until_not_in_progress
      status="$(get_stack_status)"

      if is_blocked_status "$status"; then
        if [ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] || [ "$ASSUME_YES" = "true" ]; then
          warning "Status bloqueado ($status). Recriando stack automaticamente..."
          delete_stack_force
          create_stack
        else
          error "Status bloqueado ($status). Use --recreate."
          exit 1
        fi
      else
        if ! update_stack; then
          # Se falhar e cair em rollback, podemos recriar
          wait_until_not_in_progress
          status="$(get_stack_status)"
          if is_blocked_status "$status" && ([ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] || [ "$ASSUME_YES" = "true" ]); then
            warning "Update falhou e stack ficou em $status. Recriando..."
            delete_stack_force
            create_stack
          else
            exit 1
          fi
        fi
      fi
    fi
    ;;

  apply)
    if stack_exists; then
      "$0" update "$STACK_NAME" --profile "$PROFILE" --region "$REGION" --template "$TEMPLATE_FILE" --parameters "$PARAMETERS_FILE" $( [ "$ASSUME_YES" = "true" ] && echo "--yes" ) $( [ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] && echo "--recreate" )
    else
      "$0" create "$STACK_NAME" --profile "$PROFILE" --region "$REGION" --template "$TEMPLATE_FILE" --parameters "$PARAMETERS_FILE" $( [ "$ASSUME_YES" = "true" ] && echo "--yes" ) $( [ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] && echo "--recreate" )
    fi
    ;;

  deploy)
    require_aws
    # 1) Garante stack aplicada
    "$0" apply "$STACK_NAME" \
      --profile "$PROFILE" --region "$REGION" \
      --template "$TEMPLATE_FILE" --parameters "$PARAMETERS_FILE" \
      $( [ "$ASSUME_YES" = "true" ] && echo "--yes" ) \
      $( [ "$RECREATE_ON_BLOCKED_STATUS" = "true" ] && echo "--recreate" )

    # 2) Orquestra DNS e domínio
    app_id="$(get_stack_output "AmplifyAppId")"
    if [ -z "$app_id" ] || [ "$app_id" = "None" ]; then
      error "Não consegui obter AmplifyAppId dos outputs da stack."
      exit 1
    fi

    # 2.1) Atualiza env vars por branch a partir dos arquivos env/env.* (fonte da verdade)
    prod_branch="$(param_get "RepositoryBranch")"
    staging_branch="$(param_get "StagingBranch")"
    if [ -z "${prod_branch:-}" ]; then prod_branch="main"; fi
    if [ -z "${staging_branch:-}" ]; then staging_branch="staging"; fi

    prod_env_json="$(env_file_to_json "../env/env.prod")"
    staging_env_json="$(env_file_to_json "../env/env.staging")"

    apply_branch_env_vars "$app_id" "$prod_branch" "$prod_env_json"
    apply_branch_env_vars "$app_id" "$staging_branch" "$staging_env_json"

    ensure_route53_records_from_amplify "$app_id" "$ROOT_DOMAIN_NAME" "$STAGING_SUBDOMAIN_PREFIX"
    wait_domain_ready "$app_id" "$ROOT_DOMAIN_NAME" || true

    # 3) Só então dispara deploys
    start_amplify_deploys "$app_id"
    ;;

  delete)
    if ! stack_exists; then
      success "Stack não existe; nada para deletar."
      exit 0
    fi

    if [ "$ASSUME_YES" != "true" ]; then
      warning "Isso irá deletar a stack '$STACK_NAME' e TODOS os recursos associados!"
      read -r -p "Tem certeza? Digite 'yes' para confirmar: " confirm || true
      if [ "${confirm:-}" != "yes" ]; then
        log "Operação cancelada."
        exit 0
      fi
    fi

    delete_stack_force
    ;;

  *)
    error "Ação inválida: $ACTION"
    usage
    exit 1
    ;;
esac

# Mostra os outputs da stack (exceto delete)
if [ "$ACTION" != "delete" ] && [ "$ACTION" != "status" ]; then
    log "Obtendo informações da stack..."

    outputs=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --profile "$PROFILE" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs' \
        --output json 2>/dev/null)

    if [ "$outputs" != "null" ] && [ -n "$outputs" ]; then
        echo ""
        success "Stack criada/atualizada com sucesso!"
        echo "Outputs:"
        if command -v jq >/dev/null 2>&1; then
          echo "$outputs" | jq -r '.[] | "  \(.OutputKey): \(.OutputValue)"'
        else
          python3 - <<'PY'
import json,sys
o=json.loads(sys.stdin.read() or "null")
if not o:
    sys.exit(0)
for item in o:
    print(f"  {item.get('OutputKey')}: {item.get('OutputValue')}")
PY
        fi
        echo ""
        warning "Próximos passos:"
        echo "1. Configure o webhook do GitHub no Amplify Console"
        echo "2. Faça push das branches main e staging"
        echo "3. Configure o domínio clubinhonib.com no Route 53 (se necessário)"
    fi
fi

success "Deploy concluído!"
