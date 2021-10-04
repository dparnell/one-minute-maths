#!/bin/bash

IMAGE_NAME=one-minute-maths

if [[ "$(docker images -q $IMAGE_NAME 2> /dev/null)" == "" ]]; then
	docker build -t $IMAGE_NAME - < Dockerfile
fi

docker run -it --rm --user $(id -u):$(id -g) -v $(pwd):/var/www/localhost/htdocs -p 8088:8080 $IMAGE_NAME
