# ── build stage ────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# ── runtime stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

# yt-dlp needs python3 + ffmpeg for merging/mp3 extraction
# python3 is required by some yt-dlp extractor plugins
RUN apk add --no-cache ffmpeg python3 ca-certificates

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Where downloaded files land inside the container
# Mount a host volume here to retrieve files: -v /path/on/host:/downloads
RUN mkdir -p /downloads
ENV OUT_DIR=/downloads

# Port the WebUI listens on
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Cache yt-dlp binary between restarts
VOLUME ["/root/.yoinks"]

CMD ["node", "dist/server/index.js"]
