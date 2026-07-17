#!/bin/bash

# Запускаем туннель, перенаправляя ВЕСЬ его вывод в stdout
npx localtunnel --port 8080 --subdomain foral-hre-playwright-$(date +%s) --print-url > /proc/1/fd/1 2>&1 &

# Даем туннелю 5 секунд на старт
sleep 5

# Запуск основного сервиса
node src/index.js


