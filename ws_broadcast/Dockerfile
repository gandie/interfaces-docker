FROM ubuntu:latest

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install \
    git \
    python3 \
    python3-pip \
    iproute2 \
    tree -y

RUN pip3 install --break-system-packages git+https://github.com/Klappson/docker-utils.git \
    websockets

COPY fs/ /

RUN chmod +x /usr/bin/RunBroadcastWs

WORKDIR /root

ENTRYPOINT [ "RunBroadcastWs" ]
