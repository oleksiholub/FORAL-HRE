#!/bin/bash

npx localtunnel --port 8080 --subdomain foral-hre-k6-$(date +%s) --print-url &

sleep 5

uvicorn app.main:app --host 0.0.0.0 --port 8080
