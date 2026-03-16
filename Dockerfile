FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine
RUN apk add --no-cache nginx

WORKDIR /app

COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY .env ./.env
COPY uploads ./uploads

RUN mkdir -p /app/server/data /app/uploads/blog

RUN cat <<'EOF' > /app/start.sh
#!/bin/sh
cd /app/server && node src/index.js &
nginx -g 'daemon off;'
EOF

RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
