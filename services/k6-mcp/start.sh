#!/bin/bash
lt --port 8080 --subdomain foral-hre-k6 &
python3 -m app.main
