#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0683974617}"
REGION="${REGION:-europe-central2}"
AR_REPOSITORY="${AR_REPOSITORY:-foral-hre}"

echo "== Set project =="
gcloud config set project "${PROJECT_ID}"

echo "== Enable required APIs =="
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com

echo "== Create Artifact Registry if missing =="
if ! gcloud artifacts repositories describe "${AR_REPOSITORY}" --location="${REGION}" >/dev/null 2>&1; then
  gcloud artifacts repositories create "${AR_REPOSITORY}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="FORAL HRE container images"
else
  echo "Artifact Registry repository already exists."
fi

echo "== Create Secret Manager secrets if missing =="
for secret in PLAYWRIGHT_MCP_API_KEY K6_MCP_API_KEY; do
  if ! gcloud secrets describe "${secret}" >/dev/null 2>&1; then
    gcloud secrets create "${secret}" --replication-policy="automatic"
  else
    echo "Secret ${secret} already exists."
  fi
done

echo "Bootstrap completed."
