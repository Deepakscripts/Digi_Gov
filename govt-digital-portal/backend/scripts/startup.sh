#!/bin/sh
# Startup script for Digi Gov backend
# Runs admin seed script, then starts the server

echo "Running admin seed script..."
node scripts/seedAdmin.js

echo "Starting server..."
exec node server.js
