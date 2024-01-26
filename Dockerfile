FROM oven/bun
COPY .output .
USER bun
ENV HOST 0.0.0.0
EXPOSE 300
ENTRYPOINT [ "bun", "run", "server/index.mjs" ]
