FROM node:24-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
RUN apk add --no-cache nginx

ENV NODE_ENV=production
ENV CMS_DATA_DIR=/data
ENV CMS_UPLOADS_DIR=/data/uploads

WORKDIR /app

COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY server/ ./server/
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY uploads ./seed-uploads

RUN mkdir -p /app/server/data /data/uploads/blog

RUN cat <<'EOF' > /app/start.sh
#!/bin/sh
set -e

DATA_DIR="${CMS_DATA_DIR:-/data}"
UPLOADS_DIR="${CMS_UPLOADS_DIR:-${DATA_DIR}/uploads}"
DB_PATH="${CMS_DB_PATH:-${DATA_DIR}/blog.db}"

mkdir -p "$DATA_DIR" "$UPLOADS_DIR/blog" /app/server/data

if [ ! -f "$DB_PATH" ] && [ -f /app/server/data/blog.db ]; then
  cp /app/server/data/blog.db "$DB_PATH"
  [ -f /app/server/data/blog.db-wal ] && cp /app/server/data/blog.db-wal "${DB_PATH}-wal" || true
  [ -f /app/server/data/blog.db-shm ] && cp /app/server/data/blog.db-shm "${DB_PATH}-shm" || true
fi

if [ -d /app/seed-uploads ] && [ -z "$(ls -A "$UPLOADS_DIR" 2>/dev/null)" ]; then
  cp -R /app/seed-uploads/. "$UPLOADS_DIR"/ 2>/dev/null || true
fi

cd /app/server && node src/index.js &
nginx -g 'daemon off;'
EOF

RUN chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]
