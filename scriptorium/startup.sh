#!/bin/bash

set -e

echo "Installing dependencies..."
npm install
npm install bcryptjs
npm install jsonwebtoken

if [ ! -f .env ]; then
  echo ".env file not found."
  exit 1
fi

echo "initializing db"
npx prisma generate
npx prisma migrate dev --name "init"

echo "Creating admin user"
node .createAdmin.js