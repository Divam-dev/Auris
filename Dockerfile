# Build the bot
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Runtime image
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

# Run the bot
CMD ["npm", "start"]