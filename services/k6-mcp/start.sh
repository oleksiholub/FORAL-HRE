#!/bin/bash

# Запускаем туннель, перенаправляя ВЕСЬ его вывод (ошибки и сообщения) в stdout
# /proc/1/fd/1 — это путь к главному каналу вывода контейнера (Cloud Run увидит это)
npx localtunnel --port 8080 --subdomain foral-hre-k6-$(date +%s) --print-url > /proc/1/fd/1 2>&1 &

# Даем туннелю 5 секунд на старт
sleep 5

# Запуск основного сервиса
uvicorn app.main:app --host 0.0.0.0 --port 8080
