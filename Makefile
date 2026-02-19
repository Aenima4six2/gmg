
date:=$(shell date +%s)
APP_STRING=gmg

ifndef DOCKER_HUB_USERNAME
APP=$(APP_STRING)
else
APP=$(DOCKER_HUB_USERNAME)/$(APP_STRING)
endif

.PHONY: help manifest image image-nc run install build dev test test-down test-logs test-rebuild clean

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

.DEFAULT_GOAL := help

manifest: ## Generate a manifest of what's in the box
	@echo App: $(APP) > manifest
	@echo Unix timestamp: $(date) >> manifest
	@echo last git commit: $(shell git log --pretty=oneline | head -1 | awk '{print $$1}') >> manifest
	@echo active branch: $(shell git rev-parse --abbrev-ref HEAD) >> manifest
	@echo git status: $(shell git diff --quiet || echo 'dirty') >> manifest
	@echo git has untracked files: >> manifest
	@git status -s >> manifest

image: manifest ## Build Docker Image
	cd src; docker build -t $(APP):$(date) -t $(APP):latest .

image-nc: manifest ## Build Docker Image with no caching
	cd src; docker build --no-cache -t $(APP):$(date) -t $(APP):latest .

run: ## Run the Docker image (requires .env with GMG_GRILL_HOST)
	./start

install: ## Install all npm dependencies
	cd src/gmg-client && npm install
	cd src/gmg-app && npm install
	cd src/gmg-server && npm install

build: install ## Build the UI and publish to server
	cd src/gmg-app && npm run publish

dev: install ## Start dev servers (server on :3001, UI on :5173)
	@echo "Starting gmg-server on port 3001..."
	cd src/gmg-server && npm run start:dev &
	@echo "Starting gmg-app dev server on port 5173..."
	cd src/gmg-app && npm run dev

test: ## Start app + emulator with Docker Compose for testing
	docker compose up --build -d
	@echo ""
	@echo "App running at http://localhost:3000 (with emulator)"
	@echo "Run 'make test-logs' to tail logs or 'make test-down' to stop."

test-down: ## Stop Docker Compose testing environment
	docker compose down

test-logs: ## Tail logs from Docker Compose testing environment
	docker compose logs -f

test-rebuild: ## Rebuild and restart Docker Compose testing environment
	docker compose up --build -d --force-recreate

clean: ## Remove manifest, node_modules, and build artifacts
	rm -rf manifest ./src/gmg-app/node_modules ./src/gmg-client/node_modules ./src/gmg-server/node_modules ./src/gmg-server/public/app
