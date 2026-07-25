# Playwright base: Node + Chromium + all browser system deps preinstalled.
# Keep this tag's version in sync with the "playwright" version in package.json.
FROM mcr.microsoft.com/playwright:v1.54.0-noble

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    DATA_DIR=/data

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 3000
VOLUME ["/data"]
CMD ["npm", "run", "start"]
