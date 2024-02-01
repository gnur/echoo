FROM node:lts as base
ARG PORT=3000
WORKDIR /app
COPY . .

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN yarn build

FROM oven/bun:slim
COPY --from=base /app/.output /app
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "/app/server/index.mjs" ]
