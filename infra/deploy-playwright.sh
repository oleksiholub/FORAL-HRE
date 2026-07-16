#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0683974617}"
REGION="${REGION:-europe-central2}"
AR_REPOSITORY="${AR_REPOSITORY:-foral-hre}"
SERVICE_NAME="${SERVICE_NAME:-foral-hre-playwright-mcp}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/playwright-mcp:${IMAGE_TAG:-latest}"

gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=2Gi \
  --cpu=1 \
  --timeout=900 \
  --set-env-vars="PLAYWRIGHT_MCP_REQUIRE_AUTH=true,PLAYWRIGHT_HEADLESS=true,PLAYWRIGHT_BROWSER=chromium,HOST=0.0.0.0,PORT=8080" \
  --set-secrets="PLAYWRIGHT_MCP_API_KEY=PLAYWRIGHT_MCP_API_KEY:latest"
