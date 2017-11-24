#!/bin/bash

# Build UI
(cd ./gmg-app && npm i && npm run build)

# Build Client
(cd ./gmg-client && npm i)

# Build Server
(cd ./gmg-server && npm i)
