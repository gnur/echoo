FROM oven/bun AS build
COPY . /app
WORKDIR /app
RUN bun install
RUN bun run build

FROM oven/bun
COPY --from=build /app/.output /app
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "/app/server/index.mjs" ]
