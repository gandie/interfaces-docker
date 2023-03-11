FROM ubuntu:latest

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install \
        python3 \
        python3-pip \
        git \
        iproute2 \
        tree -y

RUN pip3 install zope \
    psycopg2-binary \
    Products.PythonScripts \
    Products.ZSQLMethods \
    Products.SiteErrorLog \
    Products.StandardCacheManagers \
    Products.ExternalMethod \
    Products.MailHost \
    git+https://github.com/perfact/ZPsycopgDA \
    zope.mkzeoinstance \
    Paste

COPY fs/ /

WORKDIR /root
RUN mkwsgiinstance -u dockerzope:12345 -d wsgi

ENTRYPOINT [ "StartZope" ]