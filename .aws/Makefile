SHELL := /bin/bash

REV=$(shell git rev-parse --verify HEAD)
DATE=$(shell date +%Y-%m-%d)
CURR_DIR=$(shell pwd)

.PHONY:

build-container: .PHONY
	time docker build --file=Dockerfile \
		--tag public.ecr.aws/h6y7g4n8/tt-index-build-image-amplify:latest \
		--tag public.ecr.aws/h6y7g4n8/tt-index-build-image-amplify:$(DATE)-$(REV) \
		../

push-container: .PHONY
	aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/h6y7g4n8
	docker push public.ecr.aws/h6y7g4n8/tt-index-build-image-amplify:latest
	docker push public.ecr.aws/h6y7g4n8/tt-index-build-image-amplify:$(DATE)-$(REV)

