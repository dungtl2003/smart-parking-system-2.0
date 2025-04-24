DOCKER_USERNAME ?= huygia12
APPLICATION_NAME ?= sps-frontend
SERVER_PORT ?= 3000
CONTAINER_PORT ?= 80
ENV_FILE ?= .env

_BUILD_ARGS_TAG ?= v1
_BUILD_ARGS_DOCKERFILE ?= Dockerfile

_builder: test
	$(info ==================== building dockerfile ====================)
	docker buildx build --platform linux/amd64 --tag ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG} ./

_server:
	docker container run --rm --env-file ${ENV_FILE} -p ${SERVER_PORT}:${CONTAINER_PORT} ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG}

server:
	$(info ==================== running container ======================)
	$(MAKE) _server

build:
	$(MAKE) _builder

run:
	npm run dev

test:
	$(info ==================== running tests ==========================)
	ENV_FILE=${ENV_FILE} 

.PHONY:
	test server build run