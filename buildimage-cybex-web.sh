#!/bin/bash
###################################################################
# Script Name	: buildimage-cybex-web.sh 
# Description	: 用于生成cybex web镜像，
# 生成镜像后，可以手动执行一下指令启动容器 docker run -d --name cybex-web -p 3003:80 -v /opt/saas/frontend/dist:/usr/share/nginx/html cybex-web:V1.0.0
# Args         	: N/A
# Author       	: invan
# Email         : nan.yin@nbltrust.com
###################################################################

echo -e "build image for cybex-web"

VERSION_FILE='package.json'
VERSION=V$(jq -r '.version' $VERSION_FILE)
echo -e "start to build image cybex-web:${VERSION}"

docker stop cybex-web
docker rm cybex-web
docker rmi cybex-web:${VERSION}

echo -e "2 build the bundle file"
git pull
npm i
npm run generate:docker

echo -e "3 build docker image"
docker build --force-rm --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') --build-arg VERSION=$VERSION -t cybex-web:$VERSION -f ./Dockerfile .

echo -e "------------------------------------"
echo -e "start build image for cybex web success"
echo -e "------------------------------------"
