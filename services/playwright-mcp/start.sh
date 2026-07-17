#!/bin/bash
lt --port 8080 --subdomain foral-hre-playwright-$(date +%s) &
node src/index.js

