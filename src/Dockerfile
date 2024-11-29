# Build Phase
FROM node:14-bullseye-slim AS builder
WORKDIR /app
COPY ./gmg-app ./gmg-app
COPY ./gmg-client ./gmg-client
COPY ./gmg-server ./gmg-server
COPY ./build.sh .
RUN apt-get update && \
    apt-get install dos2unix && \
    dos2unix ./build.sh && \
    /bin/bash ./build.sh

# Run Phase
FROM node:14.18-bullseye-slim AS runtime
COPY --from=builder /app/gmg-client /app/gmg-client
COPY --from=builder /app/gmg-server /app/gmg-server

RUN apt-get update && \
    apt-get install -y tini && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    DEBUG=src.* \
    PORT=80

WORKDIR /app/gmg-server

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["node", "./bin/www"]

EXPOSE 80:80
