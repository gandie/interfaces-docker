FROM ubuntu:latest

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install \
    git \
    python3 \
    python3-pip \
    iproute2 \
    tree -y

RUN pip3 install zope \
    zope.mkzeoinstance \
    psycopg2-binary \
    git+https://github.com/gandie/Products.PythonScripts@hacked-python-scripts \
    Products.ZSQLMethods \
    Products.SiteErrorLog \
    Products.StandardCacheManagers \
    Products.ExternalMethod \
    Products.MailHost \
    git+https://github.com/perfact/ZPsycopgDA \
    perfact-zodbsync \
    git+https://loc.kplays.de:8080/Python/dockerutils.git \
    Paste

COPY fs/ /

RUN chmod +x /usr/bin/StartZeodbSync
RUN printf '#!/bin/sh\nexit 0' > /usr/sbin/policy-rc.d 

WORKDIR /root
RUN mkwsgiinstance -u dockerzope:12345 -d wsgi
RUN mkzeoinstance zeo

ENTRYPOINT [ "StartZeodbSync" ]
