#!/bin/bash
set -x

echo "--- STARTUP SCRIPT STARTED FOR K6 ---"

# Запуск туннеля
npx localtunnel --port 8080 --subdomain foral-hre-k6-$(date +%s) --print-url &

# Ждем 5 секунд
sleep 5

echo "--- STARTING MAIN APP (UVICORN) ---"
# Запуск основного приложения
uvicorn app.main:app --host 0.0.0.0 --port 8080
