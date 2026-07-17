#!/bin/bash
npx localtunnel --port 8080 --subdomain foral-hre-playwright-$(date +%s) --print-url &

sleep 5

node src/index.js

