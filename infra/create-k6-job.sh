#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0683974617}"
REGION="${REGION:-europe-central2}"
AR_REPOSITORY="${AR_REPOSITORY:-foral-hre}"
JOB_NAME="${JOB_NAME:-foral-hre-k6-runner}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/k6-runner:${IMAGE_TAG:-latest}"

if gcloud run jobs describe "${JOB_NAME}" --region="${REGION}" >/dev/null 2>&1; then
  gcloud run jobs update "${JOB_NAME}" \
    --image="${IMAGE}" \
    --region="${REGION}" \
    --memory=1Gi \
    --cpu=1 \
    --task-timeout=3600 \
    --max-retries=0
else
  gcloud run jobs create "${JOB_NAME}" \
    --image="${IMAGE}" \
    --region="${REGION}" \
    --memory=1Gi \
    --cpu=1 \
    --task-timeout=3600 \
    --max-retries=0
fi
