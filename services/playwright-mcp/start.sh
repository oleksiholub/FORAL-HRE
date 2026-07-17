#!/bin/bash
set -x 

echo "--- STARTUP SCRIPT STARTED FOR PLAYWRIGHT ---"

# Запуск туннеля
npx localtunnel --port 8080 --subdomain foral-hre-playwright-$(date +%s) --print-url &

# Ждем 5 секунд
sleep 5

echo "--- STARTING MAIN APP (NODE) ---"
# Запуск основного приложения
node src/index.js
