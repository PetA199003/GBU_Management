FROM node:18-alpine

# Minimal packages + OpenSSL für Prisma
RUN apk add --no-cache bash curl openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (simple)
RUN npm install

# Generate Prisma
RUN npx prisma generate

# Copy everything
COPY . .

EXPOSE 3000

# Simple startup
CMD sh -c "sleep 10 && npx prisma db push --accept-data-loss && npm run dev"
