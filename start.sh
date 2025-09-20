#!/bin/sh

# Start the Uvicorn server in the background
echo "Starting Uvicorn server..."
(cd backend && uvicorn main:app --host 0.0.0.0 --port 8000) &

# Start Nginx in the foreground
echo "Starting Nginx server..."
nginx -g 'daemon off;'
