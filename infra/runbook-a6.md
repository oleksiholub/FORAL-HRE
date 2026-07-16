# FORAL-HRE A.6 Operator Runbook

## Цель

Этот runbook описывает ручные действия после того, как репозиторий содержит A.1–A.5 и вы готовы перейти к GCP deploy и Perplexity connectors.

## Предпосылки

- У вас есть доступ к GCP проекту `gen-lang-client-0683974617`.
- У вас есть `gcloud` CLI или Cloud Shell.
- У вас есть доступ к GitHub репозиторию `oleksiholub/FORAL-HRE`.
- Вы готовы вручную добавить custom remote connectors в Perplexity UI.

## Порядок выполнения

### 1. Локальная проверка
```bash
cd FORAL-HRE
./infra/verify-prereqs.sh
```

Проверьте, что `gcloud` доступен, проект установлен, и необходимые APIs включены.

### 2. Bootstrap GCP
```bash
./infra/bootstrap-gcp.sh
```

Этот шаг:
- включает GCP APIs;
- создаёт Artifact Registry repository, если он ещё не существует;
- создаёт Secret Manager secrets для Playwright и k6.

### 3. Cloud Build / image build
```bash
gcloud builds submit --config cloudbuild.yaml .
```

Проверьте, что:
- `npm test` и `npm run lint` проходят для Playwright;
- `pytest -q` проходит для k6;
- образы успешно собираются и пушатся в Artifact Registry.

### 4. Deploy Playwright service
```bash
IMAGE_TAG=$(git rev-parse --short HEAD) ./infra/deploy-playwright.sh
```

### 5. Deploy k6 service
```bash
IMAGE_TAG=$(git rev-parse --short HEAD) ./infra/deploy-k6-service.sh
```

### 6. Create or update k6 job
```bash
IMAGE_TAG=$(git rev-parse --short HEAD) ./infra/create-k6-job.sh
```

### 7. Smoke checks

#### Playwright
- `GET /healthz` должен вернуть 200.
- `GET /sse` без ключа должен вернуть 401.
- `GET /sse` с ключом должен открыть MCP session.

#### k6
- `GET /healthz` должен вернуть 200.
- `GET /mcp` или mounted MCP transport должен требовать API key.
- `get_job_template` должен возвращать YAML шаблон job.

### 8. Perplexity connectors
Добавьте два custom remote connectors:
- Playwright MCP service.
- k6 MCP service.

Для обоих используйте API key auth и HTTPS endpoint, который выдаёт Cloud Run.

### 9. Record results

Запишите:
- Cloud Run service URLs;
- Artifact Registry image tags;
- результаты smoke checks;
- какие connectors удалось подключить в Perplexity UI;
- какие ошибки возникли.