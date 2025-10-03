#!/bin/bash
set -e

# Required parameters
DOKPLOY_INSTANCE_URL=$1
DOKPLOY_TOKEN=$2
DOKPLOY_BACKEND_APP_ID=$3
DOKPLOY_FRONTEND_APP_ID=$4 # This can be empty

# Check for required parameters
if [ -z "$DOKPLOY_INSTANCE_URL" ] || [ -z "$DOKPLOY_TOKEN" ] || [ -z "$DOKPLOY_BACKEND_APP_ID" ]; then
  echo "Usage: $0 <DOKPLOY_INSTANCE_URL> <DOKPLOY_TOKEN> <DOKPLOY_BACKEND_APP_ID> [DOKPLOY_FRONTEND_APP_ID]"
  exit 1
fi

echo "Deploying backend to testing environment..."
curl -X POST "$DOKPLOY_INSTANCE_URL/api/applications/redeploy" \
  -H "Authorization: Bearer $DOKPLOY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{ \"applicationId\": \"$DOKPLOY_BACKEND_APP_ID\" }"

if [ -n "$DOKPLOY_FRONTEND_APP_ID" ]; then
  echo "Deploying frontend to testing environment..."
  curl -X POST "$DOKPLOY_INSTANCE_URL/api/applications/redeploy" \
    -H "Authorization: Bearer $DOKPLOY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{ \"applicationId\": \"$DOKPLOY_FRONTEND_APP_ID\" }"
fi

echo "Deployment to testing environment triggered successfully."