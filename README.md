# Interfaces-docker - Interfaces project code running via docker

“Interfaces” will build the bridge between performing arts and computer art. Namely it will capture the dynamics and expression from dance and transport it into the world of code generated art.
“Interfaces” wants to trigger, push and moderate a dialog between generative artists and choreographers.
The end result – apart from the resulting artworks – will be a data- and knowledgebase loaded with workflow documentation, sample code, converters and scanners and other open source tools that aim to help creators to run their respective part of collaborations between dance and code art.
For a generative artist “Interfaces” will provide the dancer to perform in the parameter space of the code. For Choreographers “Interfaces” will open a new stage that has their audience in galleries and on the web.

- [YouTube Introduction](https://youtu.be/LNbGbG5nC9E?t=80)
- [Join us on Discord](https://discord.com/channels/1068875022220922900/1068875022220922902)

## Installation

### Requirements

As this is a bundle of software wrapped into docker images, you need both `
t's pretty simple
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
* ~~Postgres isn't prepared with a database on startup~~
* Many more. Keep adding to this list by opening issues please
