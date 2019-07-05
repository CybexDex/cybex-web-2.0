FROM nginx:1.15

RUN apt-get update && apt-get install -y net-tools vim telnet

COPY ./dist /usr/share/nginx/html
COPY ./dist/200.html /usr/share/nginx/html/index.html
