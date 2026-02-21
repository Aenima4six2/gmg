# Build Phase
FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache dos2unix python3 make g++
COPY ./gmg-app ./gmg-app
COPY ./gmg-client ./gmg-client
COPY ./gmg-server ./gmg-server
COPY ./build.sh .
RUN dos2unix ./build.sh && /bin/sh ./build.sh

# Run Phase
FROM node:24-alpine AS runtime
RUN apk add --no-cache tini
COPY --from=builder /app/gmg-client /app/gmg-client
COPY --from=builder /app/gmg-server /app/gmg-server

ENV NODE_ENV=production \
    DEBUG=src:* \
    PORT=80

WORKDIR /app/gmg-server

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./bin/www"]

EXPOSE 80
