FROM ubuntu:latest

RUN apt update
RUN apt install haproxy \
    iproute2 -y

COPY fs/ /

ENTRYPOINT [ "StartHaProxy" ]
