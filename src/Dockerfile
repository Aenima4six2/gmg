# Build Phase
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY ./gmg-app ./gmg-app
COPY ./gmg-client ./gmg-client
COPY ./gmg-server ./gmg-server
# npm ci installs exactly what the lockfiles pin. Only the UI build needs dev
# dependencies; the client and server get production dependencies only, so
# test tooling (jest, babel, ...) doesn't end up in the runtime image.
RUN cd gmg-app && npm ci && npm run publish \
    && cd ../gmg-client && npm ci --omit=dev \
    && cd ../gmg-server && npm ci --omit=dev

# Run Phase
FROM node:24-alpine AS runtime
# Pick up Alpine security fixes newer than the base image, and drop npm/npx/
# corepack: the server runs with plain `node`, and the npm bundled in the base
# image carries its own dependency CVEs.
RUN apk upgrade --no-cache \
    && apk add --no-cache tini \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
              /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
COPY --from=builder /app/gmg-client /app/gmg-client
COPY --from=builder /app/gmg-server /app/gmg-server

ENV NODE_ENV=production \
    DEBUG=src:* \
    PORT=80

WORKDIR /app/gmg-server

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./bin/www"]

EXPOSE 80
