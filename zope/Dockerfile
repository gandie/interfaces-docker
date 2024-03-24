FROM ubuntu:latest

RUN apt update
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt install \
        python3 \
        python3-pip \
        git \
        iproute2 \
        tree \
        ffmpeg -y

RUN pip3 install Zope[wsgi]==5.9 -c https://zopefoundation.github.io/Zope/releases/5.9/constraints.txt

RUN pip3 install psycopg2-binary \
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
    jsonpath-ng \
    mediapipe==0.9.1.0

COPY fs/ /

WORKDIR /root
RUN mkwsgiinstance -u dockerzope:12345 -d wsgi

ENTRYPOINT [ "StartZope" ]