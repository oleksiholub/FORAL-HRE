#!/bin/bash

lt --port 8080 --subdomain foral-hre-k6-$(date +%s) > /tmp/tunnel.log 2>&1 &

uvicorn app.main:app --host 0.0.0.0 --port 8080
