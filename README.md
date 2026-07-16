# FORAL-HRE

Bootstrap-инфраструктура QA и тестирования проекта FORAL HRE.

## Назначение

Репозиторий содержит два изолированных remote MCP gateway:

- `services/playwright-mcp` — browser/API E2E-проверки через Playwright
- `services/k6-mcp` — запуск и управление короткими нагрузочными проверками через k6

Целевая среда: Google Cloud Run в `europe-central2`.
GCP project ID: `gen-lang-client-0683974617`.

## Статус

Текущая стадия: **Iteration A / A.1 — структура bootstrap**.

На этой стадии нет:
- созданных Cloud Run сервисов;
- созданных Cloud Run Jobs;
- секретов в Secret Manager;
- подключённого Cloud Build trigger;
- подключённых Perplexity remote connectors;
- открытых публичных MCP endpoint-ов.

## Локальная подготовка

### Node.js

```bash
npm install
npm run test:node
npm run lint:node
```
## Локальный запуск и тестирование

Чтобы настроить окружение и запустить тесты, выполните в терминале следующие команды:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
```

Дерево проекта

```text
FORAL-HRE/
├── .gitignore
├── .env.example
├── package.json
├── pyproject.toml
├── README.md
├── services/
│   ├── playwright-mcp/
│   │   ├── src/
│   │   │   └── index.js
│   │   ├── test/
│   │   │   └── health.test.js
│   │   └── Dockerfile
│   └── k6-mcp/
│       ├── app/
│       │   └── main.py
│       ├── tests/
│       │   └── test_health.py
│       └── Dockerfile
├── pipelines/
│   └── .gitkeep
├── infra/
│   └── .gitkeep
├── scripts/
│   └── .gitkeep
└── tests/
    └── unit/
        └── .gitkeep
```
