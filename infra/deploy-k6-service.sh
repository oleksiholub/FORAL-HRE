#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0683974617}"
REGION="${REGION:-europe-central2}"
AR_REPOSITORY="${AR_REPOSITORY:-foral-hre}"
SERVICE_NAME="${SERVICE_NAME:-foral-hre-k6-mcp}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/k6-mcp:${IMAGE_TAG:-latest}"

gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE}" \
  --region="${REGION}" \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --timeout=900 \
  --set-env-vars="K6_MCP_REQUIRE_AUTH=true,K6_BIN=/usr/local/bin/k6,K6_MCP_MAX_DURATION_SECONDS=60,K6_MCP_MAX_VUS=20,K6_MCP_WORK_DIR=/tmp/k6-mcp,HOST=0.0.0.0,PORT=8080" \
  --set-secrets="K6_MCP_API_KEY=K6_MCP_API_KEY:latest"
