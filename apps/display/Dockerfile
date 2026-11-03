# Build from the repository root: docker build -f apps/display/Dockerfile -t starkid-display .
FROM node:22-bookworm-slim AS build
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate
COPY . .
RUN --mount=type=cache,id=starkid-display-pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts --store-dir=/pnpm/store && pnpm -C apps/display build
FROM node:22-bookworm-slim
WORKDIR /repo/apps/display
COPY --from=build /repo/apps/display/dist ./dist
COPY --from=build /repo/apps/display/server ./server
COPY --from=build /repo/apps/display/src/feeds.js ./src/feeds.js
COPY --from=build /repo/apps/display/package.json ./package.json
COPY --from=build /repo/packages/core/package.json /repo/packages/core/package.json
COPY --from=build /repo/packages/core/src/domain/skyEvents/skyEvents.js /repo/packages/core/src/domain/skyEvents/skyEvents.js
COPY --from=build /repo/node_modules/.pnpm/qrcode-terminal@0.11.0/node_modules/qrcode-terminal ./node_modules/qrcode-terminal
ENV PORT=4174 DISPLAY_CACHE_DIR=/data
RUN mkdir /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 4174
CMD ["node", "server/http.mjs"]
