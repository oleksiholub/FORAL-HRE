#!/bin/bash

# Логгируем начало работы
echo "Starting startup script for Playwright..."

# Запускаем туннель
lt --port 8080 --subdomain foral-hre-playwright-$(date +%s) &

# Ждем старта
sleep 5

echo "Starting main application (node)..."
# Запуск основного сервиса
node src/index.js
