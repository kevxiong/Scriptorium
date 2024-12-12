#!/bin/bash

set -e

echo "Installing dependencies..."
npm install
npm install bcryptjs
npm install jsonwebtoken
npm install typescript --save-dev
npx tsc

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

echo "initializing db"
npx prisma generate
npx prisma migrate dev --name "init"

echo "Creating admin user"
node createAdmin.js

echo "Building Docker image..."
docker build -t my-app:latest .

echo "Running Docker container..."
docker run -p 3000:3000 my-app:latest
