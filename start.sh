#!/bin/sh

# Start nginx in background
nginx &

# Start API server
cd /app
exec node api/dist/src/server.js