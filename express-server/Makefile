DOCKER_USERNAME ?= huygia12
APPLICATION_NAME ?= sps-express-server
SERVER_PORT ?= 4000
ENV_FILE ?= .env

_BUILD_ARGS_TAG ?= v1
_BUILD_ARGS_DOCKERFILE ?= Dockerfile

_builder: test
	$(info ==================== building dockerfile ====================)
	docker buildx build --platform linux/amd64 --tag ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG} ./

_server:
	docker container run --rm --env-file ${ENV_FILE} -p ${SERVER_PORT}:${SERVER_PORT} ${DOCKER_USERNAME}/${APPLICATION_NAME}:${_BUILD_ARGS_TAG}

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