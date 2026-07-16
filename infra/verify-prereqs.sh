#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0683974617}"
REGION="${REGION:-europe-central2}"

echo "== Checking local prerequisites =="
command -v gcloud >/dev/null 2>&1 || { echo "gcloud is required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "docker is required"; exit 1; }

echo "== Active gcloud account =="
gcloud auth list --filter=status:ACTIVE --format="value(account)"

echo "== Current project =="
gcloud config get-value project || true

echo "== Setting project =="
gcloud config set project "${PROJECT_ID}"

echo "== Checking required APIs =="
gcloud services list --enabled \
  --filter="name:(run.googleapis.com OR cloudbuild.googleapis.com OR artifactregistry.googleapis.com OR secretmanager.googleapis.com)" \
  --format="table(name)"

echo "== Region =="
echo "${REGION}"

echo "Prerequisite check completed."
