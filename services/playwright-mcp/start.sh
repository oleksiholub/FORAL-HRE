#!/bin/bash
lt --port 8080 --subdomain foral-hre-playwright-$(date +%s) > /tmp/tunnel.log 2>&1 &
node src/index.js

