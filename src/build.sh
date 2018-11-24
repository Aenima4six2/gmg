#!/bin/bash
set -e

# Build UI
(cd ./gmg-app && npm i && npm run publish)

# Build Client
(cd ./gmg-client && npm i)

# Build Server
(cd ./gmg-server && npm i)

# Build Emulator
(cd ./gmg-emulator && dotnet restore && dotnet build)
