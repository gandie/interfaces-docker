FROM ubuntu:latest

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install \
        python3 \
        python3-pip \
        git \
        iproute2 \
        tree \
        ffmpeg -y

RUN pip3 install zope \
    psycopg2-binary \
    git+https://github.com/gandie/Products.PythonScripts@hacked-python-scripts \
    Products.ZSQLMethods \
    Products.SiteErrorLog \
    Products.StandardCacheManagers \
    Products.ExternalMethod \
    Products.MailHost \
    git+https://github.com/perfact/ZPsycopgDA \
    git+https://loc.kplays.de:8080/Python/dockerutils.git \
    zope.mkzeoinstance \
    Paste \
    mediapipe==0.9.1.0

COPY fs/ /

WORKDIR /root
RUN mkwsgiinstance -u dockerzope:12345 -d wsgi

ENTRYPOINT [ "StartZope" ]