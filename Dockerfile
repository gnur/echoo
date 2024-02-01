FROM --platform=$BUILDPLATFORM oven/bun:slim
LABEL org.opencontainers.image.source https://github.com/gnur/echoo
LABEL org.opencontainers.image.description Simple echoo server to visualize pod load balancing

COPY .output /app
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "/app/server/index.mjs" ]
