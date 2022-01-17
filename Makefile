
date:=$(shell date +%s)
APP_STRING=gmg

ifndef DOCKER_HUB_USERNAME
APP=$(APP_STRING)
else
APP=$(DOCKER_HUB_USERNAME)/$(APP_STRING)
endif

.PHONY: manifest build image push-image prepare clean

help: ## This help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

.DEFAULT_GOAL := help

prepare:
	@echo Validating system
	@test -z $$DOCKER_HUB_USERNAME && echo 'WARN: DOCKER_HUB_USERNAME is unset. Push functions will not work.' || echo -n .
	@echo

manifest: prepare ## Generate a manifest of what's in the box
	@echo App: $(APP) > manifest
	@echo Unix timestamp: $(date) >> manifest @echo last git commit: $(shell git log --pretty=oneline |  head -1 | awk '{print $$1}') >> manifest @echo active branch: $(shell git rev-parse --abbrev-ref HEAD) >> manifest
	@echo git status: $(shell git diff --quiet || echo 'dirty') >> manifest
	@echo git has untrakced files: >> manifest
	@git status -s  >> manifest

image: manifest ## Build Docker Image
	cd src; docker build -t $(APP):$(date) -t $(APP):latest .

image-nc: manifest ## Build Docker Image with no caching
	cd src; docker build --no-cache -t $(APP):$(date) -t $(APP):latest gmg .

push-image: prepare image ## Push Docker Image to Docker hub (You may need to auth to Docker hub)
	cd src; docker push $(APP):$(date)
	cd src; docker push $(APP):latest

run: ## Helper function to run the docker image built
	./start

clean: ## Remove manifest file and purge node_modules
	rm -rf manifest ./src/gmg-app/node_modules ./src/gmg-client/node_modules ./src/gmg-server/node_modules ./src/gmg-server/public/app
