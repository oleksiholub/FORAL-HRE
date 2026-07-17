#!/bin/bash

# Логгируем начало работы
echo "Starting startup script for K6..."

# Запускаем туннель. 
# Убираем перенаправления, Cloud Run сам всё поймает.
# Используем команду 'lt', так как мы поставили его через npm -g
lt --port 8080 --subdomain foral-hre-k6-$(date +%s) &

# Ждем старта
sleep 5

echo "Starting main application (uvicorn)..."
# Запуск основного сервиса
uvicorn app.main:app --host 0.0.0.0 --port 8080
