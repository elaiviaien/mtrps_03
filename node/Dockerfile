FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .
RUN npm prune --production

FROM gcr.io/distroless/nodejs20-debian12

COPY --from=builder /app /app
WORKDIR /app

EXPOSE 3000

CMD ["app.js"]
