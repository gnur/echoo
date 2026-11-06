# syntax=docker/dockerfile:1

# Build once on the native build platform; the Nitro output is plain JavaScript
# and runs on any architecture.
FROM --platform=$BUILDPLATFORM oven/bun:1.4 AS build
WORKDIR /src
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
RUN bun run postinstall && bun run build

# Runtime image for the target platform (linux/amd64 or linux/arm64).
FROM oven/bun:1.4-slim
LABEL org.opencontainers.image.source="https://github.com/gnur/echoo"
LABEL org.opencontainers.image.description="Visualize which backend pods answer requests during Kubernetes rollouts or cross-region tests"

WORKDIR /app
COPY --from=build /src/.output /app
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
EXPOSE 3000
USER bun
ENTRYPOINT ["bun", "run", "/app/server/index.mjs"]
