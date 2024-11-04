#!/bin/bash

set -e

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

echo "Starting the server..."
npm run dev
