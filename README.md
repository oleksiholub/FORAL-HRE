# FORAL-HRE

Bootstrap-инфраструктура QA и тестирования проекта FORAL HRE.

## Назначение

Репозиторий содержит два remote MCP gateway:

- `services/playwright-mcp` — browser/API E2E-проверки через Playwright.
- `services/k6-mcp` — короткие нагрузочные проверки через k6 и шаблон Cloud Run Job для более длинных прогонов.

Целевая среда: Google Cloud Run в регионе `europe-central2` для проекта `gen-lang-client-0683974617`.

## Текущий статус

Текущая стадия: **Iteration A / A.5 подготовлен, A.1-A.4 закоммичены, A.5 ожидает применения в GCP**.

Что уже есть в репозитории:

- A.1: базовая monorepo-структура.
- A.2: Playwright MCP gateway на Node.js.
- A.3: k6 MCP gateway на Python и шаблон Cloud Run Job.
- A.4: `cloudbuild.yaml` для unit-тестов и сборки контейнеров.

Что ещё не применено в инфраструктуре:

- включение нужных GCP API;
- создание Artifact Registry;
- создание Secret Manager secrets;
- deploy Cloud Run services;
- создание Cloud Run Job;
- подключение Cloud Build trigger к GitHub;
- подключение remote MCP connectors в Perplexity UI.

## Актуальная структура репозитория

```text
FORAL-HRE/
├── .gitignore
├── .env.example
├── cloudbuild.yaml
├── package.json
├── pyproject.toml
├── README.md
├── infra/
│   ├── k6-cloud-run-job.yaml
│   ├── bootstrap-gcp.sh
│   ├── deploy-playwright.sh
│   ├── deploy-k6-service.sh
│   ├── create-k6-job.sh
│   └── verify-prereqs.sh
├── services/
│   ├── playwright-mcp/
│   │   ├── .dockerignore
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── auth.js
│   │   │   ├── config.js
│   │   │   └── index.js
│   │   └── test/
│   │       ├── auth.test.js
│   │       └── config.test.js
│   └── k6-mcp/
│       ├── .dockerignore
│       ├── Dockerfile
│       ├── Dockerfile.job
│       ├── app/
│       │   ├── __init__.py
│       │   ├── auth.py
│       │   ├── config.py
│       │   ├── k6_runner.py
│       │   ├── main.py
│       │   └── mcp_server.py
│       ├── scripts/
│       │   └── job-script.js
│       └── tests/
│           ├── test_auth.py
│           ├── test_config.py
│           ├── test_health.py
│           └── test_k6_runner_validation.py
├── pipelines/
│   └── .gitkeep
├── scripts/
│   └── .gitkeep
└── tests/
    └── unit/
        └── .gitkeep
```

## Локальная разработка

### Node.js / Playwright MCP

```bash
npm install
export PLAYWRIGHT_MCP_API_KEY=dev-local-only
export PLAYWRIGHT_MCP_REQUIRE_AUTH=true
npm run test:node
npm run lint:node
```

### Python / k6 MCP

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
export K6_MCP_API_KEY=dev-local-only
export K6_MCP_REQUIRE_AUTH=true
pytest -q
```

## Переменные окружения

1. Скопируйте шаблон:

```bash
cp .env.example .env
```

2. Никогда не коммитьте `.env` и реальные API keys.
3. В GCP реальные ключи должны храниться только в Secret Manager.

## CI/CD

`cloudbuild.yaml` выполняет:

1. Node install.
2. Unit-тесты и lint для Playwright MCP.
3. Python install и `pytest` для k6 MCP.
4. Сборку и push образов:
   - `playwright-mcp`
   - `k6-mcp`
   - `k6-runner`

Cloud Build trigger и GitHub App connection настраиваются на следующих шагах инфраструктурного bootstrap.

## Модель доступа

Оба MCP endpoint должны быть публично достижимы по HTTPS для подключения из Perplexity как remote MCP connectors, но отклонять запросы по умолчанию без корректного API key.

Поддерживаемые варианты заголовков:

- `X-API-Key: <token>`
- `Authorization: Bearer <token>`

## Порядок применения A.5

После коммита A.5 рекомендуемая последовательность такая:

1. Проверить наличие `gcloud`, проекта и нужных API.
2. Создать Artifact Registry repository.
3. Создать secrets для Playwright и k6.
4. Собрать и запушить контейнеры через Cloud Build.
5. Задеплоить Playwright service.
6. Задеплоить k6 service.
7. Создать Cloud Run Job для k6.
8. Проверить `/healthz` и защищённые endpoint-ы.
9. Только затем подключать remote connectors в Perplexity UI.

## Известные ограничения bootstrap-этапа

- Наличие файлов в репозитории не означает, что сервисы уже задеплоены.
- Успешный `healthz` не означает успешную MCP session.
- Короткие прогоны k6 через service и длинные прогоны через Job — это разные режимы исполнения.
- На bootstrap-этапе безопасность ограничена API key и не включает полный production hardening.