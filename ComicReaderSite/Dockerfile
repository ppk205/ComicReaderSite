# ──────────────────────────────────────────────────────────────────────────────
# ComicReaderSite frontend — Next.js 15 standalone server
# Build context: ./ComicReaderSite
#
# Build args:
#   NEXT_PUBLIC_API_BASE — backend API base URL baked into the client bundle
# Runtime env:
#   PORT (default 3000), HOSTNAME=0.0.0.0
# ──────────────────────────────────────────────────────────────────────────────

# Stage 1: install deps + build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG NEXT_PUBLIC_API_BASE=http://localhost:8080/Comic/api
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
RUN npm run build

# Next nests the standalone output (.next/standalone/<subdir>/server.js) when it
# infers a monorepo tracing root from a lockfile above the app — which is what a
# local build in this repo does, because of the root package-lock.json. Inside the
# image the context is ./ComicReaderSite alone, so the output is flat. Assert it,
# otherwise a nested layout would only surface as a crash-looping container.
RUN test -f .next/standalone/server.js || { \
      echo "ERROR: .next/standalone/server.js missing - nested standalone output?"; \
      ls -R .next/standalone | head -40; \
      exit 1; \
    }

# Stage 2: minimal runtime with the standalone server
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# standalone output + static assets + public files
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
