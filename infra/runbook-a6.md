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
