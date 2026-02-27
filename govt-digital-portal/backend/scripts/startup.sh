#!/bin/sh
# Startup script for Digi Gov backend
# Runs admin seed script, then starts the server

echo "Running admin seed script..."
node scripts/seedAdmin.js
if [ $? -ne 0 ]; then
    echo "ERROR: Admin seed script failed. Aborting startup."
    exit 1
fi

echo "Starting server..."
exec node server.js
