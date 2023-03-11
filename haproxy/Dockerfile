FROM ubuntu:latest

RUN apt update
RUN apt install haproxy -y

COPY fs/ /

ENTRYPOINT [ "StartHaProxy" ]
