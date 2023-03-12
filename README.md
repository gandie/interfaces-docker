# Zope-Compose - zope-docker but bigger

Currently this isn't more but just me messing around with docker-compose. Feel free to teach me if I'm doing something terribly wrong.

## What can this do at the moment?
This compose-repo will start everything you need for a zope-project.

* haproxy
* zeo in combination with zodbsync
* postgres
* zope (currently 3 instances by default)

## How to use
It's pretty simple
```bash
mkdir mounts
./StartZopeCompose
```
After that the haproxy-service will be available at
```
http://localhost:80
```

## Known uncomfortabilities waiting to be fixed

* ~~IP-Distribution for containers is not stable.~~
    * ~~This makes it impossbile to tell where haproxy is running.~~
* Postgres isn't prepared with a database on startup
* Many more. Keep adding to this list by opening issues please